package com.richie.myblog.web;


import com.richie.myblog.po.Comment;
import com.richie.myblog.po.User;
import com.richie.myblog.service.BlogService;
import com.richie.myblog.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import javax.servlet.http.HttpSession;
import java.math.BigInteger;

@Controller
public class CommentController {

    @Autowired
    private CommentService commentService;
    @Autowired
    private BlogService blogService;

    @Value("${comment.avatar}")
    private String avatar;

    @GetMapping("/comments/{blogId}")
    public String comment(@PathVariable BigInteger blogId, Model model){
        model.addAttribute("comments",commentService.listCommentByBlogId(blogId));
        return "blog :: commentList";
    }

    @PostMapping("/comments")
    public String post(Comment comment, HttpSession session){
        BigInteger blogId = comment.getBlog().getId();
        comment.setBlog(blogService.getBlog(blogId));
        User user = (User) session.getAttribute("user");
        if(user != null){
            comment.setAvatar(user.getAvatar());
            comment.setAdminComment(true);
        }else {
            comment.setAvatar(avatar);
        }
        commentService.saveComment(comment);
        return "redirect:/comments/"+blogId;
    }
}
