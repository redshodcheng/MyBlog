package com.richie.myblog.service;

import com.richie.myblog.po.Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigInteger;
import java.util.List;

public interface TypeService {

    Type saveType(Type type);

    Type getType(BigInteger id);

    Type getTypeByName(String name);

    Page<Type> listType(Pageable pageable);

    List<Type> listType();

    List<Type> listTypeTop(Integer size);

    Type updateType(BigInteger id,Type type);

    void deleteType(BigInteger id);

}
