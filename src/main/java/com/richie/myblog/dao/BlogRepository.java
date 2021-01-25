package com.richie.myblog.dao;

import com.richie.myblog.po.Blog;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.math.BigInteger;
import java.util.List;


public interface BlogRepository extends JpaRepository<Blog, BigInteger>, JpaSpecificationExecutor<Blog> {

    @Query("select b from  Blog b where  b.recommend = true")
    List<Blog> findTop(Pageable pageable);

    //select * from t_blog where title like '%內容%'
    @Query("select b from  Blog b where b.title like ?1 or b.content like ?1 ")
    Page<Blog> findByQuery(String query, Pageable pageable);

    @Transient
    @Modifying
    @Query("update  Blog  b set b.views = b.views+1 where b.id = ?1")
    int updateViews(BigInteger id);

    @Query("select function('date_format',b.updateTime,'%Y') as year from Blog b group by function('date_format',b.updateTime,'%Y') order by year desc ")
    List<String> findGroupYear();

    @Query("select b from Blog b where function('date_format',b.updateTime,'%Y') = ?1")
    List<Blog> findByYear(String year);
}
