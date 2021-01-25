package com.richie.myblog.service;

import com.richie.myblog.po.Blog;
import com.richie.myblog.vo.BlogQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

public interface BlogService {

    Blog getBlog(BigInteger id);

    Blog getAndConvert(BigInteger id);

    Page<Blog> listBlog(Pageable pageable, BlogQuery blog);

    Page<Blog> listBlog(Pageable pageable);

    Page<Blog> listBlog(BigInteger tagId,Pageable pageable);

    Page<Blog> listBlog(String query, Pageable pageable);

    List<Blog> listRecommendBlog(Integer size);

    Map<String,List<Blog>> archiveBlog();

    Long countBlog();

    Blog saveBlog(Blog blog);

    Blog updateBlog(BigInteger id,Blog blog);

    void deleteBlog(BigInteger id);
}
