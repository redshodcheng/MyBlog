package com.richie.myblog.dao;

import com.richie.myblog.po.Tag;
import com.richie.myblog.po.Type;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigInteger;
import java.util.List;

public interface TagRepository extends JpaRepository<Tag, BigInteger> {
    Tag findByName(String name);

    @Query("select t from Tag t")
    List<Tag> findTop(Pageable pageable);

}
