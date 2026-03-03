package com.chs.society.repository;

import com.chs.society.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findBySocietyId(UUID societyId);

    void deleteBySocietyId(UUID societyId);
}
