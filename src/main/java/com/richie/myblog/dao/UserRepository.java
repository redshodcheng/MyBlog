package com.richie.myblog.dao;

import com.richie.myblog.po.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User,Integer> {

    User findByUsernameAndPassword(String username,String password);
}
