package com.inb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a user in the banking system.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private boolean isActive = false;

    @Column(nullable = false)
    private boolean isApproved = false;

    @Column(nullable = false)
    private boolean isLocked = false;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;

    @CreationTimestamp
    @Column(name = "registration_date", updatable = false)
    private LocalDateTime registrationDate;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Account> accounts = new HashSet<>();

    public User(String username, String password, String firstName, String lastName,
                String email, String phoneNumber, String address) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
    }

    /**
     * Increments the failed login attempts counter.
     * If the counter reaches 3, the account is locked.
     * 
     * @return true if the account is now locked, false otherwise
     */
    public boolean incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 3) {
            this.isLocked = true;
            return true;
        }
        return false;
    }

    /**
     * Resets the failed login attempts counter.
     */
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
    }

    /**
     * Gets the user's full name.
     * 
     * @return Full name (first name + last name)
     */
    public String getFullName() {
        return this.firstName + " " + this.lastName;
    }
}
