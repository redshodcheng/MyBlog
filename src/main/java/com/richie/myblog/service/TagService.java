package com.richie.myblog.service;

import com.richie.myblog.po.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigInteger;
import java.util.List;

public interface TagService {

    Tag saveTag(Tag tag);

    Tag getTag(BigInteger id);

    Tag getTagByName(String name);

    Page<Tag> listTag(Pageable pageable);

    List<Tag> listTag();

    List<Tag> listTagTop(Integer size);

    List<Tag> listTag(String ids);

    Tag updateTag(BigInteger id,Tag type);

    void deleteTag(BigInteger id);

}
