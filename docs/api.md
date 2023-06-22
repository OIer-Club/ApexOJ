# 这是全 ApexOJ 后端 API 数据接口文档

> 由于 jyb666 是自学开发，可能有些不规范，请见谅。 QwQ

## 渲染前端会传递给 EJS 的字段

> 在 EJS 中直接 `<% if(title){} %>` 这样用即可

### 各页面都有

```json
{
    "config": /*JSON */ {
        "title": "ApexOJ", /*String 网站名称*/
        "root": "", /*String 网站根目录 默认为空*/
        "menu": { /*JSON*/
            "list": [ /* 一级菜单（靠左）*/
                {
                    "name": "首页",
                    "url": "/"
                }
            ],
            "userlist": [ /* 用户名下的二级菜单 */
                {
                    "name": "个人主页",
                    "url": "/user"
                }
            ]
        }
    },
    "session": /* JSON */ {
        "user": { /* JSON 用户数据（其余 user 字段都是这个格式） */ 
            "avatar": "", /* String 头像地址 */
            "name": "", /* String 用户名 */
            "isadmin": false, /* BOOL 是否管理员 */
        }, 
        "isphone": false, /* BOOL 时候在移动端（其实我也不知道要这个有什么用） */
        ...
    },
    "title": "XXX", /* 各个页面的标题 */
    ...
}
```

### /（首页）

现在首页什么都没有。

## API接口返回

### /api/user/login POST

请求字段

```json
{ "username":"", "password":""}
```

返回字段

```json
{ "code":"" } /* code 返回有三种 "OK" / "NO" / "ERROR" */
```

### /api/user/register POST

请求字段

```json
{ "username":"", "password":"", "email":""}
```

返回字段

```json
{ "code":"", "token (code==OK)": "", "message (code==NO)": "" }
```

