package com.carwash.config;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@ConditionalOnProperty(name = "sepay.auto-tunnel", havingValue = "true", matchIfMissing = true)
@Slf4j
public class ServeoTunnelRunner implements CommandLineRunner {

    private Process sshProcess;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    // Tunnel providers in priority order (each with name + command)
    private static final String[][] TUNNEL_COMMANDS = {
            // Serveo.net - reliable, well-known
            {"serveo.net", "ssh", "-tt", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=30",
             "-o", "ServerAliveCountMax=3", "-R", "80:localhost:8080", "serveo.net"},
            // localhost.run - fallback
            {"localhost.run", "ssh", "-tt", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=30",
             "-o", "ServerAliveCountMax=3", "-R", "80:localhost:8080", "nokey@localhost.run"}
    };

    // Patterns to detect actual tunnel URLs (NOT console/docs URLs)
    // Serveo tunnel URLs always use serveousercontent.com
    private static final Pattern SERVEO_URL = Pattern.compile("(https://[a-z0-9-]+\\.serveousercontent\\.com)");
    // localhost.run tunnel URLs use .lhr.life or .lhr.rocks
    private static final Pattern LOCALHOST_RUN_URL = Pattern.compile("(https://[a-z0-9]+\\.lhr\\.[a-z]+)");

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting auto-tunnel for SePay webhook...");

        executorService.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                for (String[] entry : TUNNEL_COMMANDS) {
                    if (Thread.currentThread().isInterrupted()) return;

                    String providerName = entry[0];
                    String[] command = new String[entry.length - 1];
                    System.arraycopy(entry, 1, command, 0, command.length);

                    log.info("Attempting tunnel via {}...", providerName);

                    try {
                        boolean wasConnected = tryTunnel(command, providerName);
                        if (wasConnected) {
                            log.warn("{} tunnel disconnected. Reconnecting in 5 seconds...", providerName);
                            Thread.sleep(5000);
                            // Don't increment provider, retry same one
                            continue;
                        } else {
                            log.warn("{} tunnel failed to connect. Trying next provider in 3 seconds...", providerName);
                            Thread.sleep(3000);
                        }
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }

                try {
                    log.warn("All tunnel providers failed. Retrying cycle in 10 seconds...");
                    Thread.sleep(10000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        });
    }

    private boolean tryTunnel(String[] command, String providerName) {
        boolean wasConnected = false;
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            sshProcess = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(sshProcess.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty()) continue;

                    log.info("[{}] {}", providerName, trimmed);

                    String tunnelUrl = extractTunnelUrl(trimmed, providerName);
                    if (tunnelUrl != null) {
                        wasConnected = true;
                        String webhookUrl = tunnelUrl + "/api/payments/sepay-webhook";
                        log.info("\n\n" +
                                "=================================================================\n" +
                                "  WEBHOOK TUNNEL OK!\n" +
                                "  Provider: " + providerName + "\n" +
                                "\n" +
                                "  WEBHOOK URL (copy this into SePay Dashboard):\n" +
                                "  " + webhookUrl + "\n" +
                                "\n" +
                                "=================================================================\n");
                    }
                }
            }

            int exitCode = sshProcess.waitFor();
            log.warn("{} tunnel exited with code {}", providerName, exitCode);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error with {} tunnel: {}", providerName, e.getMessage());
        } finally {
            if (sshProcess != null && sshProcess.isAlive()) {
                sshProcess.destroy();
            }
        }
        return wasConnected;
    }

    private String extractTunnelUrl(String line, String providerName) {
        if ("serveo.net".equals(providerName)) {
            Matcher m = SERVEO_URL.matcher(line);
            if (m.find()) return cleanUrl(m.group(1));
        } else if ("localhost.run".equals(providerName)) {
            Matcher m = LOCALHOST_RUN_URL.matcher(line);
            if (m.find()) return cleanUrl(m.group(1));
        }
        return null;
    }

    private String cleanUrl(String url) {
        // Remove trailing punctuation and whitespace
        return url.replaceAll("[,;.\\s]+$", "");
    }

    @PreDestroy
    public void stopTunnel() {
        log.info("Shutting down webhook tunnel...");
        if (sshProcess != null && sshProcess.isAlive()) {
            sshProcess.destroy();
        }
        executorService.shutdownNow();
    }
}
