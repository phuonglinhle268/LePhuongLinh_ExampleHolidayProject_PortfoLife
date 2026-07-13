package org.example.portfolife_backend.config;

import org.example.portfolife_backend.security.JwtHandshakeInterceptor;
import org.example.portfolife_backend.security.JwtUtil;
import org.example.portfolife_backend.security.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationWebSocketHandler webSocketHandler;
    private final JwtUtil jwtUtil;

    public WebSocketConfig(NotificationWebSocketHandler webSocketHandler, JwtUtil jwtUtil) {
        this.webSocketHandler = webSocketHandler;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/notifications")
                .addInterceptors(new JwtHandshakeInterceptor(jwtUtil))
                .setAllowedOrigins("*");
    }
}
