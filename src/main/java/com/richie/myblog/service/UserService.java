package com.richie.myblog.service;

import com.richie.myblog.po.User;

public interface UserService {

    User checkUser(String username,String password);
}
