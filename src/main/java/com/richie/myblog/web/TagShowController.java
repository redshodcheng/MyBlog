package com.richie.myblog.web;


import com.richie.myblog.po.Tag;
import com.richie.myblog.service.BlogService;
import com.richie.myblog.service.TagService;
import com.richie.myblog.vo.BlogQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.math.BigInteger;
import java.util.List;

@Controller
public class TagShowController {

    @Autowired
    private TagService tagService;
    @Autowired
    private BlogService blogService;

    @RequestMapping("/tags/{id}")
    public String types(@PageableDefault(size = 5,sort = {"updateTime"},direction = Sort.Direction.DESC) Pageable pageable,
                        @PathVariable BigInteger id, Model model){
        List<Tag> tags = tagService.listTagTop(10000);
        if(Integer.valueOf(String.valueOf(id))==-1){
            id = tags.get(0).getId();
        }

        model.addAttribute("tags",tags);
        model.addAttribute("page",blogService.listBlog(id,pageable));
        model.addAttribute("activeTagId",id);
        return "tags";
    }
}
