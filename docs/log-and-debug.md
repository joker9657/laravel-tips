# 日志和调试

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (工厂)](factories.md) ➡️ [下一条 (API)](api.md)

## 使用参数记录

你可以使用 `Log::info()` 或更简短的 `info()` 消息，并附加参数以提供更多关于发生情况的上下文信息。

```php
Log::info('User failed to login.', ['id' => $user->id]);
```

## 记录长时间运行的 Laravel 查询

```php
DB::enableQueryLog();

DB::whenQueryingForLongerThen(1000, function ($connection) {
     Log::warning(
          'Long running queries have been detected.',
          $connection->getQueryLog()
     );
});
```

Tip 来自 [@realstevebauman](https://twitter.com/realstevebauman/status/1576980397552185344)

## Benchmark 类

在 Laravel 9.32 中，我们有一个 Benchmark 类可以测量任何任务的时间。

这是一个非常有用的辅助类：

```php
class OrderController
{
     public function index()
     {
          return Benchmark::measure(fn () => Order::all()),
     }
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1583096196494553088)

## 更方便的 DD

不再使用 `dd($result)` 你可以直接在 Eloquent 查询语句或任何集合后面添加 `->dd()` 方法。

```php
// Instead of
$users = User::where('name', 'Taylor')->get();
dd($users);
// Do this
$users = User::where('name', 'Taylor')->get()->dd();
```

## 带上下文的日志记录

在 Laravel 8.49 中新增了 `Log::withContext()` 方法，可以帮助你区分不同请求之间的日志消息。

如果你创建一个中间件并设置上下文，所有的日志消息都将包含该上下文，这样你可以更轻松地进行搜索。

```php
public function handle(Request $request, Closure $next)
{
    $requestId = (string) Str::uuid();

    Log::withContext(['request-id' => $requestId]);

    $response = $next($request);

    $response->header('request-id', $requestId);

    return $response;
}
```

## 快速输出 Eloquent 查询的 SQL 形式

如果你想快速输出 Eloquent 查询的 SQL 形式，可以使用 toSql() 方法。

```php
$invoices = Invoice::where('client', 'James pay')->toSql();

dd($invoices)
// select * from `invoices` where `client` = ?
```

Tip 来自 [@devThaer](https://twitter.com/devThaer/status/1438816135881822210)

## 在开发过程中记录所有数据库查询

如果你想在开发过程中记录所有的数据库查询，可以将以下代码片段添加到你的 AppServiceProvider。

```php
public function boot()
{
    if (App::environment('local')) {
        DB::listen(function ($query) {
            logger(Str::replaceArray('?', $query->bindings, $query->sql));
        });
    }
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1473262634405449730)

## 发现一次请求中触发的所有事件

如果你想为特定的事件实现新的监听器，但不知道它的名称，你可以记录请求期间触发的所有事件。

可以在 `app/Providers/EventServiceProvider.php` 的 `boot()` 方法中使用 `\Illuminate\Support\Facades\Event::listen()` 方法来捕获所有触发的事件。

**重要提示:** 如果在此事件监听器中使用 `Log` 门面，则需要排除名称为 `Illuminate\Log\Events\MessageLogged` 的事件，以避免无限循环。（例如：`if ($event == 'Illuminate\\Log\\Events\\MessageLogged') return;`）

```php
// Include Event...
use Illuminate\Support\Facades\Event;

// In your EventServiceProvider class...
public function boot()
{
    parent::boot();

    Event::listen('*', function ($event, array $data) {
        // Log the event class
        error_log($event);

        // Log the event data delegated to listener parameters
        error_log(json_encode($data, JSON_PRETTY_PRINT));
    });
}
```

Tip 来自 [@MuriloChianfa](https://github.com/MuriloChianfa)
