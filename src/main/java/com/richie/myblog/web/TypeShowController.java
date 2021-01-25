package com.richie.myblog.web;


import com.richie.myblog.po.Type;
import com.richie.myblog.service.BlogService;
import com.richie.myblog.service.TypeService;
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
public class TypeShowController {

    @Autowired
    private TypeService typeService;
    @Autowired
    private BlogService blogService;

    @RequestMapping("/types/{id}")
    public String types(@PageableDefault(size = 5,sort = {"updateTime"},direction = Sort.Direction.DESC) Pageable pageable,
                        @PathVariable BigInteger id, Model model){
        List<Type> types = typeService.listTypeTop(10000);
        if(Integer.valueOf(String.valueOf(id))==-1){
            id = types.get(0).getId();
        }
        BlogQuery blogQuery = new BlogQuery();
        blogQuery.setTypeId(id);
        model.addAttribute("types",types);
        model.addAttribute("page",blogService.listBlog(pageable,blogQuery));
        model.addAttribute("activeTypeId",id);
        return "types";
    }
}
