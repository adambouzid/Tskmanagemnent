package com.taskapp.backend.repositories;

import com.taskapp.backend.entities.User;
import com.taskapp.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
@Repository


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findFirstByEmail(String email);
    List<User> findByUserRole(UserRole userRole); // Changed from single result to List
    boolean existsByEmail(String email);

    // Recherche paginée par nom ou email, avec filtre optionnel par rôle
    @Query("SELECT u FROM User u WHERE (:role IS NULL OR u.userRole = :role) AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, @Param("role") UserRole role, Pageable pageable);
}
