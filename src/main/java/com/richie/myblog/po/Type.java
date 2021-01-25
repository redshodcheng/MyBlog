package com.richie.myblog.po;



import javax.persistence.*;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;



@Entity
@Table(name = "t_type")
public class Type {

    @Id
    @GeneratedValue
    private BigInteger id;
    private String name;

    @OneToMany(mappedBy = "type")
    private List<Blog> blogs = new ArrayList<>();

    public Type() {
    }

    public BigInteger getId() {
        return id;
    }

    public void setId(BigInteger id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Blog> getBlogs() {
        return blogs;
    }

    public void setBlogs(List<Blog> blogs) {
        this.blogs = blogs;
    }

    @Override
    public String toString() {
        return "Type{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
