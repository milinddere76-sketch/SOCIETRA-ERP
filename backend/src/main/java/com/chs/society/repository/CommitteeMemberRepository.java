package com.chs.society.repository;

import com.chs.society.model.CommitteeMember;
import com.chs.society.model.Society;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommitteeMemberRepository extends JpaRepository<CommitteeMember, UUID> {
    List<CommitteeMember> findBySocietyAndIsActiveTrue(Society society);

    List<CommitteeMember> findBySociety(Society society);

    List<CommitteeMember> findBySocietyId(UUID societyId);

    @Modifying
    void deleteBySocietyId(UUID societyId);

    @Modifying
    @Query("DELETE FROM CommitteeMember c WHERE c.email = (SELECT u.email FROM User u WHERE u.id = :userId)")
    void deleteByUserId(@Param("userId") UUID userId);
}
