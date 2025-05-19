package com.inb.service.impl;

import com.inb.config.JwtTokenProvider;
import com.inb.dto.JwtAuthResponse;
import com.inb.dto.LoginRequest;
import com.inb.dto.RegistrationRequest;
import com.inb.exception.AccountLockedException;
import com.inb.exception.ResourceNotFoundException;
import com.inb.model.User;
import com.inb.repository.UserRepository;
import com.inb.service.AccountService;
import com.inb.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of the UserService interface.
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AccountService accountService;

    @Override
    @Transactional
    public User registerUser(RegistrationRequest registrationRequest) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Create new user
        User user = new User(
                registrationRequest.getUsername(),
                passwordEncoder.encode(registrationRequest.getPassword()),
                registrationRequest.getFirstName(),
                registrationRequest.getLastName(),
                registrationRequest.getEmail(),
                registrationRequest.getPhoneNumber(),
                registrationRequest.getAddress()
        );

        // Save user to database
        User savedUser = userRepository.save(user);
        
        return savedUser;
    }

    @Override
    @Transactional
    public User approveUserRegistration(Long userId) {
        User user = getUserById(userId);
        
        if (user.isApproved()) {
            throw new RuntimeException("User is already approved");
        }
        
        userRepository.approveUser(userId);
        
        // Retrieve the updated user
        User approvedUser = getUserById(userId);
        
        // Create initial account based on the account type specified during registration
        // This would normally come from the registration request, but we're simulating it here
        accountService.createAccount(userId, null);
        
        return approvedUser;
    }

    @Override
    public JwtAuthResponse authenticateUser(LoginRequest loginRequest) {
        // Get user by username
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        
        // Check if user is locked
        if (user.isLocked()) {
            throw new AccountLockedException("Your account has been locked. Please contact the bank for assistance.");
        }
        
        // Check if user is approved and active
        if (!user.isApproved() || !user.isActive()) {
            throw new RuntimeException("Your account is not active. Please wait for approval or contact the bank.");
        }
        
        try {
            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);
            
            // Reset failed login attempts on successful login
            userRepository.resetFailedLoginAttempts(user.getId());
            
            // Return response with token and user details
            JwtAuthResponse response = new JwtAuthResponse();
            response.setToken(jwt);
            response.setUser(user);
            
            return response;
        } catch (Exception e) {
            // Increment failed login attempts
            boolean isLocked = user.incrementFailedLoginAttempts();
            userRepository.save(user);
            
            if (isLocked) {
                throw new AccountLockedException("Your account has been locked due to multiple failed login attempts. Please contact the bank for assistance.");
            }
            
            throw new RuntimeException("Invalid username or password");
        }
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersPendingApproval() {
        return userRepository.findByIsApproved(false);
    }

    @Override
    public List<User> getLockedUsers() {
        return userRepository.findByIsLocked(true);
    }

    @Override
    @Transactional
    public User lockUserAccount(Long userId) {
        User user = getUserById(userId);
        userRepository.lockUserAccount(userId);
        return getUserById(userId);
    }

    @Override
    @Transactional
    public User unlockUserAccount(Long userId) {
        User user = getUserById(userId);
        userRepository.unlockUserAccount(userId);
        return getUserById(userId);
    }

    @Override
    @Transactional
    public User updateUser(Long userId, User updatedUser) {
        User user = getUserById(userId);
        
        // Update user fields
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setAddress(updatedUser.getAddress());
        
        // Email and username changes require additional validation
        if (!user.getEmail().equals(updatedUser.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email is already registered");
            }
            user.setEmail(updatedUser.getEmail());
        }
        
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update with new password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        return userRepository.save(user);
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElse(null);
    }
}
