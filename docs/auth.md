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

## 自定义身份验证事件

Laravel 的身份验证系统在身份验证过程中会触发各种事件，允许你钩入这些事件并执行额外的操作或自定义逻辑。

例如，你可能想记录用户的登录。
你可以通过监听 `Illuminate\Auth\Events\Login` 事件来实现这一点。

要实现这一点：

1. 为事件创建事件监听器类。你可以使用 Artisan 命令生成这些类：
```bash
php artisan make:listener LogSuccessfulLogin
```
2. 编写事件发生时的执行逻辑：
```php
// app/Listeners/LogSuccessfulLogin.php
namespace App\Listeners;

use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    public function handle(Login $event)
    {
        // Log the successful login
        Log::info("User with ID ".$event->user->id." successfully logged in.");
    }
}
```
3. 在 `EventServiceProvider` 中注册事件监听器：
```php
// app/Providers/EventServiceProvider.php
namespace App\Providers;

use Illuminate\Auth\Events\Login;
use App\Listeners\LogSuccessfulLogin;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            LogSuccessfulLogin::class,
        ]
    ];

    // Other event listeners...
}
```
现在，每当有用户登录你的应用程序，你就可以通过检查 `/storage/logs/laravel.log` 中的 Laravel 日志文件来注意到。



