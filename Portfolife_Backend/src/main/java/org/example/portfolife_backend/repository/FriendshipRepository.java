package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.userOne.id = :u1 AND f.userTwo.id = :u2) OR " +
            "(f.userOne.id = :u2 AND f.userTwo.id = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);
    
    @Query("SELECT f FROM Friendship f WHERE f.userOne.id = :userId OR f.userTwo.id = :userId")
    List<Friendship> findAllByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
            "(f.userOne.id = :u1 AND f.userTwo.id = :u2) OR " +
            "(f.userOne.id = :u2 AND f.userTwo.id = :u1)")
    boolean existBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);
}
