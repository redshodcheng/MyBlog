package com.richie.myblog.dao;

import com.richie.myblog.po.Comment;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigInteger;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, BigInteger> {

    List<Comment> findByBlogIdAndParentCommentNull(BigInteger id, Sort sort);
}
