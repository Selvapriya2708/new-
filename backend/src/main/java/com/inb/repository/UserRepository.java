package com.inb.repository;

import com.inb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides methods to interact with the users table in the database.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by username.
     * 
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by email.
     * 
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a username already exists.
     * 
     * @param username The username to check
     * @return true if the username exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Check if an email already exists.
     * 
     * @param email The email to check
     * @return true if the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find users by approval status.
     * 
     * @param isApproved The approval status to search for
     * @return List of users with the specified approval status
     */
    List<User> findByIsApproved(boolean isApproved);

    /**
     * Find users by active status.
     * 
     * @param isActive The active status to search for
     * @return List of users with the specified active status
     */
    List<User> findByIsActive(boolean isActive);

    /**
     * Find users by locked status.
     * 
     * @param isLocked The locked status to search for
     * @return List of users with the specified locked status
     */
    List<User> findByIsLocked(boolean isLocked);

    /**
     * Reset the failed login attempts for a user.
     * 
     * @param userId The ID of the user
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.failedLoginAttempts = 0 WHERE u.id = ?1")
    void resetFailedLoginAttempts(Long userId);

    /**
     * Increment the failed login attempts for a user.
     * 
     * @param userId The ID of the user
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = ?1")
    void incrementFailedLoginAttempts(Long userId);

    /**
     * Lock a user account.
     * 
     * @param userId The ID of the user
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isLocked = true WHERE u.id = ?1")
    void lockUserAccount(Long userId);

    /**
     * Unlock a user account.
     * 
     * @param userId The ID of the user
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isLocked = false, u.failedLoginAttempts = 0 WHERE u.id = ?1")
    void unlockUserAccount(Long userId);

    /**
     * Approve a user account.
     * 
     * @param userId The ID of the user
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isApproved = true, u.isActive = true WHERE u.id = ?1")
    void approveUser(Long userId);
}
