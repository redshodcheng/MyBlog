package com.richie.myblog.service;

import com.richie.myblog.NotFountException;
import com.richie.myblog.dao.TagRepository;
import com.richie.myblog.po.Tag;
import com.richie.myblog.po.Type;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    @Transactional
    @Override
    public Tag saveTag(Tag tag) {
        return tagRepository.save(tag);
    }

    @Transactional
    @Override
    public Tag getTag(BigInteger id) {
        return tagRepository.findById(id).orElse(null);
    }

    @Override
    public Tag getTagByName(String name) {
        return tagRepository.findByName(name);
    }

    @Transactional
    @Override
    public Page<Tag> listTag(Pageable pageable) {
        return tagRepository.findAll(pageable);
    }

    @Override
    public List<Tag> listTag() {
        return tagRepository.findAll();
    }

    @Override
    public List<Tag> listTagTop(Integer size) {
        Sort sort = Sort.by(Sort.Direction.DESC,"blogs.size");
        Pageable pageable = PageRequest.of(0,size,sort);
        return tagRepository.findTop(pageable);
    }

    @Override
    public List<Tag> listTag(String ids) {
        return tagRepository.findAllById(convertToList(ids));
    }

    private List<BigInteger> convertToList(String ids) {
        List<BigInteger> list = new ArrayList<>();
        if (!"".equals(ids) && ids != null) {
            String[] idarray = ids.split(",");
            for (int i=0; i < idarray.length;i++) {
                list.add(new BigInteger(idarray[i]));
            }
        }
        return list;
    }


    @Transactional
    @Override
    public Tag updateTag(BigInteger id, Tag tag) {
        Tag t = tagRepository.findById(id).orElse(null);
        if(t == null){
            throw new NotFountException("不存在該類型");
        }
        BeanUtils.copyProperties(tag,t);
        return tagRepository.save(t);
    }

    @Transactional
    @Override
    public void deleteTag(BigInteger id) {
        tagRepository.deleteById(id);
    }


}
