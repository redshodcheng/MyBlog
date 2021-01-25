package com.richie.myblog.service;

import com.richie.myblog.po.Comment;

import java.math.BigInteger;
import java.util.List;

public interface CommentService {

    List<Comment> listCommentByBlogId(BigInteger blogId);

    Comment saveComment(Comment comment);
}
