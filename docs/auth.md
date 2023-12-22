# 用户授权

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (集合)](collections.md) ➡️ [下一条 (邮件)](mail.md)

## 一次性检查多个权限

除了 `@can` Blade 指令之外，你知道你还可以使用 `@canany` 指令一次性检查多个权限吗？

```blade
@canany(['update', 'view', 'delete'], $post)
    // The current user can update, view, or delete the post
@elsecanany(['create'], \App\Post::class)
    // The current user can create a post
@endcanany
```

## 通过更多选项对用户进行身份验证

如果你只想对已经 “激活” 的用户进行身份验证，只需要向 `Auth::attempt()` 方法传递额外的参数即可。

不需要复杂的中间件或全局作用域。

```php
Auth::attempt(
    [
        ...$request->only('email', 'password'),
        fn ($query) => $query->whereNotNull('activated_at')
    ],
    $this->boolean('remember')
);
```

Tip 来自 [@LukeDowning19](https://twitter.com/LukeDowning19)

## 用户注册后的更多事件

想在新用户注册后执行一些操作？请转到 `app/Providers/EventServiceProvider.php` 文件，并添加更多的监听器类，然后在这些类中实现 `handle()` 方法，并使用 `$event->user` 对象。

```php
class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,

            // You can add any Listener class here
            // With handle() method inside of that class
        ],
    ];
```

## 你知道 Auth::once() 吗?

你可以使用 `Auth::once()` 方法仅在一次请求中登录用户。
不会使用会话或 cookie，这意味着在构建无状态 API 时，该方法可能会很有帮助。

```php
if (Auth::once($credentials)) {
    //
}
```

## 在用户密码更新时更改 API 令牌

当用户的密码更改时，更改用户的 API 令牌非常方便。

模型:

```php
protected function password(): Attribute
{
    return Attribute::make(
            set: function ($value, $attributes) {
                $value = $value;
                $attributes['api_token'] = Str::random(100);
            }
        );
}
```

## 超级管理员覆盖权限

如果你已经定义了门卫（Gates），但希望超级管理员用户覆盖所有权限，以给予超级管理员所有权限，你可以在 `AuthServiceProvider.php` 文件中使用 `Gate::before()` 语句拦截门卫。

```php
// Intercept any Gate and check if it's super admin
Gate::before(function($user, $ability) {
    if ($user->is_super_admin == 1) {
        return true;
    }
});

// Or if you use some permissions package...
Gate::before(function($user, $ability) {
    if ($user->hasPermission('root')) {
        return true;
    }
});
```

如果你希望在没有用户的情况下在门卫中执行某些操作，你需要为 `$user` 添加一个允许为 `null` 的类型提示。例如，如果你为未登录用户定义了一个名为 "Anonymous" 的角色：

```php
Gate::before(function (?User $user, $ability) {
    if ($user === null) {
        $role = Role::findByName('Anonymous');
        return $role->hasPermissionTo($ability) ? true : null;
    }
    return $user->hasRole('Super Admin') ? true : null;
});
```

