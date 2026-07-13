package org.example.portfolife_backend.security;

import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * identifier: cho phép đăng nhập bằng username, email, HOẶC số điện thoại
     * (LoginRequest.identifier trong SRS mục 3.4 mở rộng).
     */
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmailOrPhoneNumber(identifier, identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + identifier));
        return new CustomUserDetails(user);
    }
}

