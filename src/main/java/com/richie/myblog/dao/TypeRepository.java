package com.richie.myblog.dao;

import com.richie.myblog.po.Type;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigInteger;
import java.util.List;

public interface TypeRepository extends JpaRepository<Type, BigInteger> {
    Type findByName(String name);

    @Query("select  t from Type t")
    List<Type> findTop(Pageable pageable);
}
