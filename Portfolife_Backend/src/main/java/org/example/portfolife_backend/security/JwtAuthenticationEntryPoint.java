package org.example.portfolife_backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;

/**
 * Được gọi khi request tới endpoint yêu cầu xác thực nhưng không có/JWT không hợp lệ.
 * Trả JSON 401 thay vì trang lỗi HTML mặc định của Spring Security.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> body = Map.of(
                "status", "ERROR",
                "message", "Bạn cần đăng nhập để truy cập tài nguyên này."
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
