package com.inb.service;

import com.inb.dto.JwtAuthResponse;
import com.inb.dto.LoginRequest;
import com.inb.dto.RegistrationRequest;
import com.inb.model.User;

import java.util.List;

/**
 * Service interface for user-related operations.
 */
public interface UserService {

    /**
     * Register a new user.
     * 
     * @param registrationRequest The registration request details
     * @return The registered user
     */
    User registerUser(RegistrationRequest registrationRequest);

    /**
     * Approve a user registration.
     * 
     * @param userId The ID of the user to approve
     * @return The approved user
     */
    User approveUserRegistration(Long userId);

    /**
     * Authenticate a user and generate a JWT token.
     * 
     * @param loginRequest The login request details
     * @return JWT auth response containing the token and user details
     */
    JwtAuthResponse authenticateUser(LoginRequest loginRequest);

    /**
     * Get user by ID.
     * 
     * @param id The ID of the user to retrieve
     * @return The user with the specified ID
     */
    User getUserById(Long id);

    /**
     * Get user by username.
     * 
     * @param username The username of the user to retrieve
     * @return The user with the specified username
     */
    User getUserByUsername(String username);

    /**
     * Get all users.
     * 
     * @return List of all users
     */
    List<User> getAllUsers();

    /**
     * Get users pending approval.
     * 
     * @return List of users pending approval
     */
    List<User> getUsersPendingApproval();

    /**
     * Get locked users.
     * 
     * @return List of locked users
     */
    List<User> getLockedUsers();

    /**
     * Lock a user account.
     * 
     * @param userId The ID of the user to lock
     * @return The locked user
     */
    User lockUserAccount(Long userId);

    /**
     * Unlock a user account.
     * 
     * @param userId The ID of the user to unlock
     * @return The unlocked user
     */
    User unlockUserAccount(Long userId);

    /**
     * Update user details.
     * 
     * @param userId The ID of the user to update
     * @param user The updated user details
     * @return The updated user
     */
    User updateUser(Long userId, User user);

    /**
     * Change user password.
     * 
     * @param userId The ID of the user
     * @param oldPassword The old password
     * @param newPassword The new password
     * @return The user with updated password
     */
    User changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * Check if a username is available.
     * 
     * @param username The username to check
     * @return true if available, false otherwise
     */
    boolean isUsernameAvailable(String username);

    /**
     * Check if an email is available.
     * 
     * @param email The email to check
     * @return true if available, false otherwise
     */
    boolean isEmailAvailable(String email);

    /**
     * Get the current authenticated user.
     * 
     * @return The current authenticated user
     */
    User getCurrentUser();
}
