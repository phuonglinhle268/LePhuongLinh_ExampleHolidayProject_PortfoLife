package org.example.portfolife_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Chạy trước UsernamePasswordAuthenticationFilter, đọc header "Authorization: Bearer <token>",
 * validate và nếu hợp lệ thì set Authentication vào SecurityContext cho request hiện tại.
 * Nếu token không hợp lệ/hết hạn/thiếu, request vẫn đi tiếp mà không set Authentication -
 * SecurityConfig sẽ tự trả 401 nếu endpoint yêu cầu xác thực (qua JwtAuthenticationEntryPoint).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String username = jwtUtil.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(token, userDetails.getUsername())
                        && !isTokenIssuedBeforePasswordChange(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            logger.debug("JWT không hợp lệ hoặc đã hết hạn: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Trả về true nếu token được cấp TRƯỚC thời điểm mật khẩu bị đổi gần nhất -
     * tức token này đã cũ (do quên mật khẩu/đổi mật khẩu) và phải bị từ chối,
     * dù chữ ký vẫn hợp lệ và chưa hết hạn.
     */
    private boolean isTokenIssuedBeforePasswordChange(String token, UserDetails userDetails) {
        if (!(userDetails instanceof CustomUserDetails customUserDetails)) {
            return false;
        }

        LocalDateTime passwordChangedAt = customUserDetails.getUser().getPasswordChangedAt();
        if (passwordChangedAt == null) {
            return false;
        }

        var tokenIssuedAt = jwtUtil.extractIssuedAt(token).toInstant();
        var passwordChangedAtInstant = passwordChangedAt.atZone(ZoneId.systemDefault()).toInstant();

        return tokenIssuedAt.isBefore(passwordChangedAtInstant);
    }
}