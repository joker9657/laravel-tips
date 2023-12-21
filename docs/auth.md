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

Want to perform some actions after new user registration? Head to `app/Providers/EventServiceProvider.php` and add more Listeners classes, and then in those classes implement `handle()` method with `$event->user` object

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

## Did you know about Auth::once()?

You can login with user only for ONE REQUEST, using method `Auth::once()`.
No sessions or cookies will be utilized, which means this method may be helpful when building a stateless API.

```php
if (Auth::once($credentials)) {
    //
}
```

## Change API Token on users password update

It's convenient to change the user's API Token when its password changes.

Model:

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

## Override Permissions for Super Admin

If you've defined your Gates but want to override all permissions for SUPER ADMIN user, to give that superadmin ALL permissions, you can intercept gates with `Gate::before()` statement, in `AuthServiceProvider.php` file.

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

If you want to do something in your Gate when there is no user at all, you need to add a type hint for `$user` allowing it to be `null`. For example, if you have a role called Anonymous for your non-logged-in users:

```php
Gate::before(function (?User $user, $ability) {
    if ($user === null) {
        $role = Role::findByName('Anonymous');
        return $role->hasPermissionTo($ability) ? true : null;
    }
    return $user->hasRole('Super Admin') ? true : null;
});
```

