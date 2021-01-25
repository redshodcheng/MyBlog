package com.richie.myblog.web.admin;

import com.richie.myblog.po.Blog;
import com.richie.myblog.po.User;
import com.richie.myblog.service.BlogService;
import com.richie.myblog.service.TagService;
import com.richie.myblog.service.TypeService;
import com.richie.myblog.vo.BlogQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;
import java.math.BigInteger;


@Controller
@RequestMapping("/admin")
public class BlogController {

    private static final String INPUT = "admin/blogs-input";
    private static final String LIST  = "admin/blogs";
    private static final String REDIRECT_LIST = "redirect:/admin/blogs";


    @Autowired
    private BlogService blogService;
    @Autowired
    private TypeService typeService;
    @Autowired
    private TagService  tagService;

    @GetMapping("/blogs")
    public String blogs(@PageableDefault(size = 4,sort = {"updateTime"},direction = Sort.Direction.DESC) Pageable pageable,
                        BlogQuery blog, Model model){
        model.addAttribute("types",typeService.listType());
        model.addAttribute("page",blogService.listBlog(pageable,blog));
            return LIST;
    }

    @PostMapping("/blogs/search")
    public String search(@PageableDefault(size = 5,sort = {"updateTime"},direction = Sort.Direction.DESC) Pageable pageable,
                         BlogQuery blog, Model model){
        model.addAttribute("page",blogService.listBlog(pageable,blog));
        return "admin/blogs :: blogList";
    }

    @GetMapping("/blogs/input")
    public String input(Model model){
        setTypeAndTag(model);
        model.addAttribute("blog",new Blog());
        return INPUT;
    }
    private void setTypeAndTag(Model model){
        model.addAttribute("types",typeService.listType());
        model.addAttribute("tags",tagService.listTag());
    }
    @GetMapping("/blogs/{id}/input")
    public String editinput(@PathVariable BigInteger id,Model model){
        setTypeAndTag(model);
        Blog blog = blogService.getBlog(id);
        blog.init();
        model.addAttribute("blog",blogService.getBlog(id));
        return INPUT;
    }

   //使用POSTMapping會報錯
     //@PostMapping("/blogs")
    @RequestMapping(value = "/blogs",method = RequestMethod.POST)
    public String post(Blog blog, RedirectAttributes attributes, HttpSession session){

        blog.setUser((User) session.getAttribute("user"));
        blog.setType(typeService.getType(blog.getType().getId()));
        blog.setTags(tagService.listTag(blog.getTagIds()));

        Blog b ;
        if(blog.getId() == null){
            b =  blogService.saveBlog(blog);
        }else {
            b = blogService.updateBlog(blog.getId(),blog);
        }

        if(b==null){
            attributes.addFlashAttribute("message","新增失敗");
        }else {
            attributes.addFlashAttribute("message","新增成功");
        }
        return REDIRECT_LIST;
    }

    @GetMapping("/blogs/{id}/delete")
    public String delete(@PathVariable BigInteger id,RedirectAttributes attributes){
        blogService.deleteBlog(id);
        attributes.addFlashAttribute("message","刪除成功");
        return REDIRECT_LIST;
    }
}
