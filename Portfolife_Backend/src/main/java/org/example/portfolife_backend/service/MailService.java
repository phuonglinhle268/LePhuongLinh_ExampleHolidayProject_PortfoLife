package org.example.portfolife_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Bọc JavaMailSender để gửi email OTP. Cấu hình SMTP nằm ở application.properties
 * (spring.mail.*). Dùng SimpleMailMessage (plain text) cho đơn giản - có thể nâng
 * cấp sang MimeMessage + HTML template sau nếu cần giao diện đẹp hơn.
 */
@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode, int expirationMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("PortfoLife - Mã xác thực đặt lại mật khẩu");
        message.setText(
                "Xin chào,\n\n" +
                        "Mã OTP để đặt lại mật khẩu PortfoLife của bạn là: " + otpCode + "\n\n" +
                        "Mã có hiệu lực trong " + expirationMinutes + " phút và chỉ dùng được 1 lần.\n" +
                        "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                        "Trân trọng,\nPortfoLife"
        );

        mailSender.send(message);
    }
}
