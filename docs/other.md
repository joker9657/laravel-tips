# Other

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (API)](api.md)

## Localhost in .env

在你的 `.env` 文件中，不要忘记将 `APP_URL` 从 `http://localhost` 更改为实际的 URL，因为它将成为电子邮件通知和其他地方链接的基础。

```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:9PHz3TL5C4YrdV6Gg/Xkkmx9btaE93j7rQTUZWm2MqU=
APP_DEBUG=true
APP_URL=http://localhost
```

## 过去 / 未来的时间值

如果你想要一个过去/未来的时间值，你可以使用各种 Laravel/Carbon 助手进行链式操作，比如 `now()->[添加或减去某些时间]->setTime()`

```php
$product = Product::factory()->create([
     'published_at' => now()->addDay()->setTime(14, 00),
]);
```

## 在响应发送到浏览器后执行一些操作

你还可以使用中间件在响应发送到浏览器后执行一些操作。这种中间件被称为 Terminable Middleware。

你可以通过在中间件上定义一个 `terminate` 方法来使中间件可终止。

这个方法在响应发送到浏览器后会自动调用。它将同时拥有请求和响应作为参数。

```php
class TerminatingMiddleware
{
    public function handle($request, Closure $next)
    {
        return $next($request);
    }
 
    public function terminate($request, $response)
    {
        // ...
    }
}
```

Tip 来自 [@Laratips1](https://twitter.com/Laratips1/status/1567045288338280448/)

## 重定向并带有 URL 片段

你知道在 Laravel 中重定向到路由时可以添加一个 URI 片段吗？

当重定向到页面的特定部分时非常有用。例如，产品页面上的评论部分。

```php
return redirect()
     ->back()
     ->withFragment('contactForm');
     // domain.test/url#contactForm

return redirect()
     ->route('product.show')
     ->withFragment('reviews');
     // domain.test/product/23#reviews
```

Tip 来自 [@ecrmnn](https://twitter.com/ecrmnn/status/1574813643425751040)

## 使用中间件调整传入的请求

Laravel 的中间件是转换传入请求的好方法。例如，我决定在我的应用程序中重命名一个模型；而不是为了一个破坏性的更改而增加 API 版本，我只需使用旧的引用转换这些请求。

```php
class ConvertLicenseeIntoContact
{
     public function handle(Request $request, Closure $next)
     {
          if($request->json('licensee_id')) {
               $request->json()->set('contact_id', $request->json('licensee_id'));
          }

          return $next($request);
     }
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1581214787467235329)

## 从 Laravel 应用中重定向到其他网站

有时，你可能需要从你的 Laravel 应用程序重定向到其他网站。在这种情况下，你可以在 redirect() 方法上调用一个方便的 away 方法...

```php
redirect()->away('https://www.google.com');
```

它创建一个 `RedirectResponse`，没有额外的 URL 编码、表单验证或其他验证。

Tip 来自 [@Laratips1](https://twitter.com/Laratips1/status/1581887837972361216)

## Blade 指令在特定环境中显示数据

你知道 Laravel 有一个 'production' Blade 指令，你可以使用它来只在生产环境中显示数据吗？

还有另一个 'env' 指令，你可以使用它来在指定的环境中显示数据。

```blade
@production
     // I am only visible to the production environment...
@endproduction

@env('staging')
     // I am only visible to the staging environment...
@endenv

@env(['staging', 'production'])
     // I am only visible to both the staging and production environment...
@endenv
```

Tip 来自 [@Laratips1](https://twitter.com/Laratips1/status/1582615079874220032)

## 基于时区调度 Laravel 任务

你知道你可以基于时区调度 Laravel 任务吗？

设置单个命令的时区：

```php
$schedule->command('reportg:generate')
         ->timezone('America/New_York')
         ->at('2:00');
```

如果你要为所有的调度任务重复分配相同的时区，你可以在 `app\Console\Kernel` 类中定义一个 `scheduleTimezone` 方法：

```php
protected function scheduleTimezone()
{
     return 'America/Chicago';
}
```

Tip 来自 [@binumathew](https://twitter.com/binumathew/status/1584830693791928320)

## 使用 assertModelMissing 而不是 assertDatabaseMissing

在测试模型删除时，使用 assertModelMissing 而不是 assertDatabaseMissing

```php
/** @test */
public function allowed_user_can_delete_task()
{
     $task = Task::factory()->for($this->project)->create();

     $this->deleteJson($task->path())
          ->assertNoContent();

     // Instead of assertDatabaseMissing to check if the model missing from the database
     $this->assertDatabaseMissing('tasks', ['id' => $task->id]);

     // use directly assertModelMissing
     $this->assertModelMissing($task);
}
```

Tip 来自 [@h_ik04](https://twitter.com/h_ik04/status/1585593621193129986)

## 格式化 diffForHumans() 的各种选项

在 Carbon 中，你知道你可以为 diffForHumans() 添加各种选项吗？[阅读文档获取更多示例。](https://carbon.nesbot.com/docs/#api-humandiff)

```php
$user->created_at->diffForHumans();
```
=> `"17 hours ago"`


```php
$user->created_at->diffForHumans([
     'parts' => 2
]);
```
=> `"17 hours 54 minutes ago"`


```php
$user->created_at->diffForHumans([
     'parts' => 3
     'join' => ', ',
]);
```
=> `"17 hours, 54 minutes, 50 seconds ago"`


```php
$user->created_at->diffForHumans([
     'parts' => 3,
     'join' => ', ',
     'short' => true,
]);
```
=> `"17h, 54m, 50s ago"`

## 在运行时创建自定义磁盘

你知道你可以在运行时创建自定义磁盘，而无需在 config/filesystems 文件中进行配置吗？

这在管理自定义路径中的文件时非常方便，而无需将它们添加到配置中。

```php
$avatarDisk = Storage::build([
    'driver' => 'local',
    'root' => storage_path('app/avatars'),
]);
$avatarDisk->put('user_avatar.jpg', $image);
```

Tip 来自 [@wendell_adriel](https://twitter.com/wendell_adriel/)

## 何时（不）运行 run "composer update"

不要在生产服务器上运行 `composer update`，这样会很慢并且可能会破坏代码库。请在本地计算机上运行 `composer update`，将新的 `composer.lock` 提交到代码库，然后在生产服务器上运行 `composer install`。

## Composer: 检查更新版本

如果你想查找哪些 `composer.json` 中的包有新版本发布，只需运行 `composer outdated` 命令。你将得到一个完整的列表，包含以下信息：

```
phpdocumentor/type-resolver 0.4.0 0.7.1
phpunit/php-code-coverage   6.1.4 7.0.3 Library that provides collection, processing, and rende...
phpunit/phpunit             7.5.9 8.1.3 The PHP Unit Testing framework.
ralouphie/getallheaders     2.0.5 3.0.3 A polyfill for getallheaders.
sebastian/global-state      2.0.0 3.0.0 Snapshotting of global state
```

## 自动大写翻译

在翻译文件（`resources/lang`）中，你不仅可以将变量指定为 `:variable`，还可以大写为 `:VARIABLE` 或 `:Variable`，然后无论你传递什么值，它都会自动转换为大写。

```php
// resources/lang/en/messages.php
'welcome' => 'Welcome, :Name'

// Result: "Welcome, Taylor"
echo __('messages.welcome', ['name' => 'taylor']);
```

## Carbon 只包含小时

如果你想获取当前日期，但不包含秒和/或分钟，可以使用 Carbon 的方法，如 `setSeconds(0)` 或 `setMinutes(0)`。

```php
// 2020-04-20 08:12:34
echo now();

// 2020-04-20 08:12:00
echo now()->setSeconds(0);

// 2020-04-20 08:00:00
echo now()->setSeconds(0)->setMinutes(0);

// Another way - even shorter
echo now()->startOfHour();
```

## 单一动作控制器

如果你想创建一个只有一个动作的控制器，可以使用 `__invoke()` 方法，甚至创建一个 "可调用" 的控制器。

路由:

```php
Route::get('user/{id}', ShowProfile::class);
```

Artisan:

```bash
php artisan make:controller ShowProfile --invokable
```

控制器:

```php
class ShowProfile extends Controller
{
    public function __invoke($id)
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

## 重定向到特定控制器方法

你不仅可以使用 `redirect()` 重定向到 URL 或特定路由，还可以重定向到特定控制器的特定方法，甚至传递参数。使用以下代码：

```php
return redirect()->action([SomeController::class, 'method'], ['param' => $value]);
```

## 使用较旧的 Laravel 版本

如果你希望使用较旧的 Laravel 版本而不是最新版，可以使用以下命令：

```bash
composer create-project --prefer-dist laravel/laravel project "7.*"
```

将 7.* 更改为你想要使用的版本。

## 添加参数到分页链接

在默认的分页链接中，你可以传递额外的参数，保留原始的查询字符串，甚至指向特定的 `#xxxxx` 锚点。

```blade
{{ $users->appends(['sort' => 'votes'])->links() }}

{{ $users->withQueryString()->links() }}

{{ $users->fragment('foo')->links() }}
```

## 可重复使用的回调函数

如果你有一个需要多次重复使用的回调函数，你可以将其赋值给一个变量，然后进行重复使用。

```php
$userCondition = function ($query) {
    $query->where('user_id', auth()->id());
};

// Get articles that have comments from this user
// And return only those comments from this user
$articles = Article::with(['comments' => $userCondition])
    ->whereHas('comments', $userCondition)
    ->get();
```

## Request: 检查任意参数

你不仅可以使用 `$request->has()` 方法检查一个参数，还可以使用 `$request->hasAny()` 方法检查多个参数是否存在：

```php
public function store(Request $request)
{
    if ($request->hasAny(['api_key', 'token'])) {
        echo 'We have API key passed';
    } else {
        echo 'No authorization parameter';
    }
}
```

## 简单分页

在分页中，如果你只想要 "上一页 / 下一页" 链接而不是所有的页码（这样可以减少数据库查询），只需将 `paginate()` 改为 `simplePaginate()` ：

```php
// Instead of
$users = User::paginate(10);

// You can do this
$users = User::simplePaginate(10);
```

## Blade 指令添加 true / false 条件

Laravel 8.51 中新增了 `@class` Blade 指令，用于根据某个 CSS 类是否应该添加来添加 true / false 条件。在 [文档](https://laravel.com/docs/8.x/blade#conditional-classes) 中了解更多信息。

之前的写法：

```php
<div class="@if ($active) underline @endif">`
```

现在可以这样写:

```php
<div @class(['underline' => $active])>
```

```php
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1445417511546023938)

## Jobs 可以不使用队列

在文档的 "队列" 部分讨论了 Jobs，但你可以在不使用队列的情况下使用 Jobs，只需将其作为类来委派任务。
只需从控制器中调用 `$this->dispatchNow()` 即可。

```php
public function approve(Article $article)
{
    //
    $this->dispatchNow(new ApproveArticle($article));
    //
}
```

## 在工厂或填充器之外使用 Faker

如果你想生成一些虚假数据，即使在工厂或填充器之外的任何类中，你也可以使用 Faker。

请注意：在生产环境中使用它，你需要将 faker 从 `"require-dev"` 移动到 `"require"` 中的 `composer.json` 中。

```php
use Faker;

class WhateverController extends Controller
{
    public function whatever_method()
    {
        $faker = Faker\Factory::create();
        $address = $faker->streetAddress;
    }
}
```

## 定时任务

你可以以多种不同的结构来安排每天/每小时运行的定时任务。

你可以安排一个 Artisan 命令、一个 Job 类、一个可调用类、一个回调函数，甚至执行一个 shell 脚本。

```php
use App\Jobs\Heartbeat;

$schedule->job(new Heartbeat)->everyFiveMinutes();
```

```php
$schedule->exec('node /home/forge/script.js')->daily();
```

```php
use App\Console\Commands\SendEmailsCommand;

$schedule->command('emails:send Taylor --force')->daily();

$schedule->command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

```php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        DB::table('recent_users')->delete();
    })->daily();
}
```

## 搜索 Laravel 文档

如果你想在 Laravel 文档中搜索某个关键词，默认情况下只会显示前 5 个结果。也许还有更多的结果？

如果你想查看所有结果，你可以直接访问 GitHub 上的 Laravel 文档存储库进行搜索。https://github.com/laravel/docs

## 过滤路由列表

在 Laravel 8.34 中新增了 `php artisan route:list` 命令的 `--except-path` 标志，因此你可以过滤掉你不想看到的路由。[查看原始 PR](https://github.com/laravel/framework/pull/36619)

## Blade 指令以避免重复

如果你在多个 Blade 文件中反复进行相同的数据格式化操作，你可以创建自己的 Blade 指令。

下面是使用 Laravel Cashier 中的方法进行金额格式化的示例。

```php
"require": {
        "laravel/cashier": "^12.9",
}
```

```php
public function boot()
{
    Blade::directive('money', function ($expression) {
        return "<?php echo Laravel\Cashier\Cashier::formatAmount($expression, config('cashier.currency')); ?>";
    });
}
```

```php
<div>Price: @money($book->price)</div>
@if($book->discount_price)
    <div>Discounted price: @money($book->dicount_price)</div>
@endif
```

## Artisan 命令帮助

如果你对某个 Artisan 命令的参数不确定，或者想知道有哪些可用参数，只需输入 `php artisan help [你想要的命令]`。

## 在测试中禁用惰性加载

如果你不想在运行测试时阻止延迟加载，你可以禁用它

```php
Model::preventLazyLoading(!$this->app->isProduction() && !$this->app->runningUnitTests());
```

Tip 来自 [@djgeisi](https://twitter.com/djgeisi/status/1435538167290073090)

## 使用 Laravel 的两个强大助手函数会带来神奇的结果

在 Laravel 中使用两个强大的助手函数会带来神奇的结果...

在这个例子中，服务将被调用并重试（retry）。如果仍然失败，将会报告错误，但请求不会失败（rescue）

```php
rescue(function () {
    retry(5, function () {
        $this->service->callSomething();
    }, 200);
});
```

Tip 来自 [@JuanDMeGon](https://twitter.com/JuanDMeGon/status/1435466660467683328)

## 请求参数的默认值

在这里，我们检查是否存在 per_page（或任何其他参数）的值，如果存在，则使用它；否则，使用默认值。

```php
// Isteand of this
$perPage = request()->per_page ? request()->per_page : 20;

// You can do this
$perPage = request('per_page', 20);
```

Tip 来自 [@devThaer](https://twitter.com/devThaer/status/1437521022631165957)

## 直接将中间件传递给路由，无需注册

```php
Route::get('posts', PostController::class)
    ->middleware(['auth', CustomMiddleware::class])
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1438258486815690766)

## 将数组转换为 CSS 类

```php
use Illuminate\Support\Arr;

$array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

$isActive = false;
$hasError = true;

$classes = Arr::toCssClasses($array);

/*
 * 'p-4 bg-red'
 */
```

Tip 来自 [@dietsedev](https://twitter.com/dietsedev/status/1438550428833271808)

## Laravel Cashier (Stripe) 中的 "upcomingInvoice" 方法

你可以显示客户在下一个计费周期中将支付的金额。

Laravel Cashier（Stripe）中有一个 "upcomingInvoice" 方法，用于获取即将到来的发票的详细信息。

```php
Route::get('/profile/invoices', function (Request $request) {
    return view('/profile/invoices', [
        'upcomingInvoice' => $request->user()->upcomingInvoice(),
        'invoices' => $request-user()->invoices(),
    ]);
});
```

Tip 来自 [@oliverds\_](https://twitter.com/oliverds_/status/1439997820228890626)

## Laravel Request exists() vs has()

```php
// https://example.com?popular
$request->exists('popular') // true
$request->has('popular') // false

// https://example.com?popular=foo
$request->exists('popular') // true
$request->has('popular') // true
```

Tip 来自 [@coderahuljat](https://twitter.com/coderahuljat/status/1442191143244951552)

## 返回带有变量的视图的多种方法

```php
// First way ->with()
return view('index')
    ->with('projects', $projects)
    ->with('tasks', $tasks)

// Second way - as an array
return view('index', [
        'projects' => $projects,
        'tasks' => $tasks
    ]);

// Third way - the same as second, but with variable
$data = [
    'projects' => $projects,
    'tasks' => $tasks
];
return view('index', $data);

// Fourth way - the shortest - compact()
return view('index', compact('projects', 'tasks'));
```

## 定时执行 shell 命令

我们可以在 Laravel 的计划命令中定时执行 shell 命令。

```php
// app/Console/Kernel.php

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        $schedule->exec('node /home/forge/script.js')->daily();
    }
}
```

Tip 来自 [@anwar_nairi](https://twitter.com/anwar_nairi/status/1448985254794915845)

## 发送不验证的 HTTP 客户端请求

有时，在本地环境中，你可能希望发送不验证 SSL 的 HTTP 请求，可以这样做：

```php
return Http::withoutVerifying()->post('https://example.com');
```

如果你想设置多个选项，可以使用 `withOptions` 方法。

```php
return Http::withOptions([
    'verify' => false,
    'allow_redirects' => true
])->post('https://example.com');
```

Tip 来自 [@raditzfarhan](https://github.com/raditzfarhan)

## 不进行断言的测试

有些测试不进行断言，只是启动可能会引发异常的某些内容。

```php
class MigrationsTest extends TestCase
{
    public function test_successful_foreign_key_in_migrations()
    {
        // We just test if the migrations succeeds or throws an exception
        $this->expectNotToPerformAssertions();


       Artisan::call('migrate:fresh', ['--path' => '/database/migrations/task1']);
    }
}
```

## "Str::mask()" 方法

Laravel 8.69 版本发布了 "Str::mask()" 方法，该方法使用重复字符对字符串的一部分进行屏蔽。

```php
class PasswordResetLinkController extends Controller
{
    public function sendResetLinkResponse(Request $request)
    {
        $userEmail = User::where('email', $request->email)->value('email'); // username@domain.com

        $maskedEmail = Str::mask($userEmail, '*', 4); // user***************

        // If needed, you provide a negative number as the third argument to the mask method,
        // which will instruct the method to begin masking at the given distance from the end of the string

        $maskedEmail = Str::mask($userEmail, '*', -16, 6); // use******domain.com
    }
}
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1457029765634744322)

## 扩展 Laravel 类

许多内置的 Laravel 类上都有一个名为 macro 的方法。例如 Collection、Str、Arr、Request、Cache、File 等等。

你可以像这样在这些类上定义自己的方法：

```php
Str::macro('lowerSnake', function (string $str) {
    return Str::lower(Str::snake($str));
});

// Will return: "my-string"
Str::lowerSnake('MyString');
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1457635252466298885)

## Can 特性

如果你正在运行 Laravel `v8.70`，你可以直接链式调用 `can()` 方法，而不是使用 `middleware('can:..')`。

```php
// instead of
Route::get('users/{user}/edit', function (User $user) {
    ...
})->middleware('can:edit,user');

// you can do this
Route::get('users/{user}/edit', function (User $user) {
    ...
})->can('edit' 'user');

// PS: you must write UserPolicy to be able to do this in both cases
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1458179766192853001)

## 临时下载链接

你可以使用临时下载链接来保护云存储资源，防止未经授权的访问。例如，当用户想要下载文件时，我们将重定向到一个带有5秒过期时间的临时的 S3 资源 URL。

```php
public function download(File $file)
{
    // Initiate file download by redirecting to a temporary s3 URL that expires in 5 seconds
    return redirect()->to(
        Storage::disk('s3')->temporaryUrl($file->name, now()->addSeconds(5))
    );
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1458791323889197064)

## 处理深层嵌套数组

如果你有一个复杂的数组，你可以使用 `data_get()` 辅助函数使用 "点" 符号和通配符从嵌套数组中检索值。

```php
$data = [
  0 => ['user_id' => 1, 'created_at' => 'timestamp', 'product' => {object Product}],
  1 => ['user_id' => 2, 'created_at' => 'timestamp', 'product' => {object Product}],
  2 => etc
];

// Now we want to get all products ids. We can do like this:

data_get($data, '*.product.id');

// Now we have all products ids [1, 2, 3, 4, 5, etc...]
```

在下面的示例中，如果 `request`、`user` 或 `name` 任何一个缺失，你将会得到错误。

```php
$value = $payload['request']['user']['name'];

// The data_get function accepts a default value, which will be returned if the specified key is not found.

$value = data_get($payload, 'request.user.name', 'John')
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1460970984568094722)

## 自定义异常的呈现方式

你可以通过在异常类中添加一个 'render' 方法来自定义异常的呈现方式。

例如，当请求期望 JSON 时，可以返回 JSON 而不是 Blade 视图。

```php
abstract class BaseException extends Exception
{
    public function render(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'meta' => [
                    'valid'   => false,
                    'status'  => static::ID,
                    'message' => $this->getMessage(),
                ],
            ], $this->getCode());
        }

        return response()->view('errors.' . $this->getCode(), ['exception' => $this], $this->getCode());
    }
}
```

```php
class LicenseExpiredException extends BaseException
{
    public const ID = 'EXPIRED';
    protected $code = 401;
    protected $message = 'Given license has expired.'
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1461331239240192003/)

## tap 辅助函数

`tap` 辅助函数是一种很好的方式，可以在调用对象的方法后去除单独的返回语句，使代码更加简洁。

```php
// without tap
$user->update(['name' => 'John Doe']);

return $user;

// with tap()
return tap($user)->update(['name' => 'John Doe']);
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1462058149314183171)

## 重置剩余的时间单位

你可以在 `DateTime::createFromFormat` 方法中插入一个感叹号来重置剩余的时间单位。

```php
// 2021-10-12 21:48:07.0
DateTime::createFromFormat('Y-m-d', '2021-10-12');

// 2021-10-12 00:00:00.0
DateTime::createFromFormat('!Y-m-d', '2021-10-12');

// 2021-10-12 21:00:00.0
DateTime::createFromFormat('!Y-m-d H', '2021-10-12');
```

Tip 来自 [@SteveTheBauman](https://twitter.com/SteveTheBauman/status/1448045021006082054)

## 在控制台内核中安排的命令在出现问题时可以自动通过电子邮件发送其输出

你知道在控制台内核中安排的任何命令在出现问题时可以自动通过电子邮件发送其输出吗？

```php
$schedule
    ->command(PruneOrganizationsCOmmand::class)
    ->hourly()
    ->emailOutputOnFailure(config('mail.support'));
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1463160409905455104)

## 使用 GET 参数构建自定义过滤查询时要小心

```php
if (request()->has('since')) {
    // example.org/?since=
    // fails with illegal operator and value combination
    $query->whereDate('created_at', '<=', request('since'));
}

if (request()->input('name')) {
    // example.org/?name=0
    // fails to apply query filter because evaluates to false
    $query->where('name', request('name'));
}

if (request()->filled('key')) {
    // correct way to check if get parameter has value
}
```

Tip 来自 [@mc0de](https://twitter.com/mc0de/status/1465209203472146434)

## 清理你臃肿的路由文件

清理你臃肿的路由文件并将其拆分以保持井井有条

```php
class RouteServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->routes(function () {
            Route::prefix('api/v1')
                ->middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));

            Route::prefix('webhooks')
                ->namespace($this->namespace)
                ->group(base_path('routes/webhooks.php'));

            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));

            if ($this->app->environment('local')) {
                Route::middleware('web')
                    ->namespace($this->namespace)
                    ->group(base_path('routes/local.php'));
            }
        });
    }
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1466068376330153984)

## 将电子邮件发送到自定义日志文件

在 Laravel 中，你可以将电子邮件发送到自定义日志文件。

你可以像这样设置环境变量：

```
MAIL_MAILER=log
MAIL_LOG_CHANNEL=mail
```

还可以配置日志通道：

```php
'mail' => [
    'driver' => 'single',
    'path' => storage_path('logs/mails.log'),
    'level' => env('LOG_LEVEL', 'debug'),
],
```

现在你的所有电子邮件都在 /logs/mails.log 中。

这是一个快速测试邮件的好例子。

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1466362508571131904)

## 简化Markdown转换为HTML

Laravel 提供了一个接口，可以直接将 Markdown 转换为 HTML，无需安装新的 composer 包。

```php
$html = Str::markdown('# Changelogfy')
```

输出:

```
<h1>Changelogfy</h1>
```

Tip 来自 [@paulocastellano](https://twitter.com/paulocastellano/status/1467478502400315394)

## 使用 whenFilled() 助手简化请求中的条件判断

我们经常编写 if 语句来检查请求中是否存在某个值。

你可以使用 `whenFilled()` 助手来简化它。

```php
public function store(Request $request)
{
    $request->whenFilled('status', function (string $status)) {
        // Do something amazing with the status here!
    }, function () {
        // This it called when status is not filled
    });
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1467886802711293959)

## 向中间件传递参数

你可以通过在路由后面添加 ':' 和值来为特定路由传递参数。例如，我正在使用单个中间件根据路由强制执行不同的身份验证方法。

```php
Route::get('...')->middleware('auth.license');
Route::get('...')->middleware('auth.license:bearer');
Route::get('...')->middleware('auth.license:basic');
```

```php
class VerifyLicense
{
    public function  handle(Request $request, Closure $next, $type = null)
    {
        $licenseKey  = match ($type) {
            'basic'  => $request->getPassword(),
            'bearer' => $request->bearerToken(),
            default  => $request->get('key')
        };

        // Verify license and return response based on the authentication type
    }
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1471864630486179840)

## 从会话中获取值并删除

如果你需要从 Laravel 会话中获取某些内容，然后立即删除它，请考虑使用 `session()->pull($value)`。它为你完成了这两个步骤。

```php
// Before
$path = session()->get('before-github-redirect', '/components');

session()->forget('before-github-redirect');

return redirect($path);

// After
return redirect(session()->pull('before-github-redirect', '/components'))
```

Tip 来自 [@jasonlbeggs](https://twitter.com/jasonlbeggs/status/1471905631619715077)

## $request->date() 方法

在 Laravel v8.77 中新增了 `$request->date()` 方法。

现在你不需要手动调用 Carbon，可以像这样使用：`$post->publish_at = $request->date('publish_at')->addHour()->startOfHour()`;

[完整 pr 链接](https://github.com/laravel/framework/pull/39945) by [@DarkGhostHunter](https://twitter.com/DarkGhostHunter)

## 在使用分页时使用 through 而不是 map

当你想要对分页数据进行映射并返回字段的子集时，使用 `through` 而不是 `map`。`map` 会破坏分页对象并改变其标识，而 `through` 则在分页数据本身上进行操作。

```php
// Don't: Mapping paginated data
$employees = Employee::paginate(10)->map(fn ($employee) => [
    'id' => $employee->id,
    'name' => $employee->name
])

// Do: Mapping paginated data
$employees = Employee::paginate(10)->through(fn ($employee) => [
    'id' => $employee->id,
    'name' => $employee->name
])
```

Tip 来自 [@bhaidar](https://twitter.com/bhaidar/status/1475073910383120399)

## 快速向 HTTP 请求添加 Bearer Token

有一个 `withToken` 方法可以将 `Authorization` 头附加到请求中。

```php
// Booo!
Http::withHeader([
    'Authorization' => 'Bearer dQw4w9WgXcq'
])

// YES!
Http::withToken('dQw4w9WgXcq');
```

Tip 来自 [@p3ym4n](https://twitter.com/p3ym4n/status/1487809735663489024)

## 复制文件或文件夹中的所有文件

你可以使用 `readStream` 和 `writeStream` 方法将文件（或文件夹中的所有文件）从一个磁盘复制到另一个磁盘，以保持内存使用低。

```php
// List all the files from a folder
$files = Storage::disk('origin')->allFiles('/from-folder-name');

// Using normal get and put (the whole file string at once)
foreach($files as $file) {
    Storage::disk('destination')->put(
        "optional-folder-name" . basename($file),
        Storage::disk('origin')->get($file)
    );
}

// Best: using Streams to keep memory usage low (good for large files)
foreach ($files as $file) {
    Storage::disk('destination')->writeStream(
        "optional-folder-name" . basename($file),
        Storage::disk('origin')->readStream($file)
    );
}
```

Tip 来自 [@alanrezende](https://twitter.com/alanrezende/status/1488194257567498243)

## Sessions has() vs exists() vs missing()

你是否了解 Laravel 会话中的 `has`、`exists` 和 `missing` 方法？

```php
// The has method returns true if the item is present & not null.
$request->session()->has('key');

// THe exists method returns true if the item ir present, event if its value is null
$request->session()->exists('key');

// THe missing method returns true if the item is not present or if the item is null
$request->session()->missing('key');
```

Tip 来自 [@iamharis010](https://twitter.com/iamharis010/status/1489086240729145344)

## 测试是否将正确的数据传递给视图

需要测试是否将正确的数据传递给视图吗？你可以在响应上使用 viewData 方法。以下是一些示例：

```php
/** @test */
public function it_has_the_correct_value()
{
    // ...
    $response = $this->get('/some-route');
    $this->assertEquals('John Doe', $response->viewData('name'));
}

/** @test */
public function it_contains_a_given_record()
{
    // ...
    $response = $this->get('/some-route');
    $this->assertTrue($response->viewData('users')->contains($userA));
}

/** @test */
public function it_returns_the_correct_amount_of_records()
{
    // ...
    $response = $this->get('/some-route');
    $this->assertCount(10, $response->viewData('users'));
}
```

Tip 来自 [@JuanRangelTX](https://twitter.com/JuanRangelTX/status/1489944361580351490)

## 使用 Redis 跟踪页面访问量

使用 MySQL 跟踪页面访问量在处理高流量时可能会带来很大的性能损耗。Redis 在这方面更好。你可以使用 Redis 和定时命令在固定间隔内将 MySQL 保持同步。

```php
Route::get('{project:slug', function (Project $project) {
    // Instead of $project->increment('views') we use Redis
    // We group the views by the project id
    Redis::hincrby('project-views', $project->id, 1);
})
```

```php
// Console/Kernel.php
$schedule->command(UpdateProjectViews::class)->daily();

// Console/Commands/UpdateProjectViews.php
// Get all views from our Redis instance
$views = Redis::hgetall('project-views');

/*
[
    (id) => (views)
    1 => 213,
    2 => 100,
    3 => 341
]
 */

// Loop through all project views
foreach ($views as $projectId => $projectViews) {
    // Increment the project views on our MySQL table
    Project::find($projectId)->increment('views', $projectViews);
}

// Delete all the views from our Redis instance
Redis::del('project-views');
```

Tip 来自 [@Philo01](https://twitter.com/JackEllis/status/1491909483496411140)

## to_route() 辅助函数

Laravel 9 提供了 `response()->route()` 的缩写版本，请看下面的代码:

```php
// Old way
Route::get('redirectRoute', function() {
    return redirect()->route('home');
});

// Post Laravel 9
Route::get('redirectRoute', function() {
    return to_route('home');
});

```

这个辅助函数的工作方式与 `redirect()->route('home')` 相同，但比旧方法更简洁。

Tip 来自 [@CatS0up](https://github.com/CatS0up)

## 当队列工作进程关闭时暂停长时间运行的作业

在运行长时间作业时，如果你的队列工作进程被以下方式关闭：

- 停止工作进程。
- 发送 **SIGTERM** 信号 (Horizon 使用 **SIGINT**).
- 按下 `CTRL + C` (Linux / Windows).

那么作业过程可能会在执行某个操作时中断。

通过检查 `app('queue.worker')->shouldQuit`，我们可以确定工作进程是否正在关闭。这样，我们就可以保存当前进程并重新将作业放入队列，以便当队列工作进程再次运行时，可以从中断的地方继续执行。

这在容器化世界（Kubernetes、Docker 等）中非常有用，容器会在任何时候被销毁和重新创建。

```php
<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MyLongJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600;

    private const CACHE_KEY = 'user.last-process-id';

    public function handle()
    {
        $processedUserId = Cache::get(self::CACHE_KEY, 0); // Get last processed item id
        $maxId = Users::max('id');

        if ($processedUserId >= $maxId) {
            Log::info("All users have already been processed!");
            return;
        }

        while ($user = User::where('id', '>', $processedUserId)->first()) {
            Log::info("Processing User ID: {$user->id}");

            // Your long work here to process user
            // Ex. Calling Billing API, Preparing Invoice for User etc.

            $processedUserId = $user->id;
            Cache::put(self::CACHE_KEY, $processedUserId, now()->addSeconds(3600)); // Updating last processed item id

            if (app('queue.worker')->shouldQuit) {
                $this->job->release(60); // Requeue the job with delay of 60 seconds
                break;
            }
        }

        Log::info("All users have processed successfully!");
    }
}
```

Tip 来自 [@a-h-abid](https://github.com/a-h-abid)

## 在 Laravel 测试中冻结时间

在 Laravel 测试中，你可能需要冻结时间。

如果你想基于时间戳进行断言或需要基于日期和 / 或时间进行查询，这将非常有用。

```php
// To freeze the time, you used to be able to write this at the time top of your tests:
Carbon::setTestNow(Carbon::now());
// You could also use the "travelTo" method:
$this->travelTo(Carbon::now());
// You can now use the new "freezeTime" method to keep your code readable and obvious:
$this->freezeTime();
```

Tip 来自 [@AshAllenDesign](https://twitter.com/AshAllenDesign/status/1509115721183158272)

## 新的压缩助手

从 Laravel 9.7 版本开始，新增了 `squish` 助手函数。

```php
$result = Str::squish(' Hello   John,         how   are   you?    ');
// Hello John, how are you?
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1511718052752150534)

## 指定定时任务失败或成功时的操作

你可以指定定时任务失败或成功时的操作。

```php
$schedule->command('emails:send')
        ->daily()
        ->onSuccess(function () {
            // The task succeeded
        })
        ->onFailure(function () {
            // The task failed
        });
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1513221529072414720)

## 在特定环境下运行计划命令

在 Laravel 中，可以在特定环境下运行计划命令。

```php
// Not good
if (app()->environment('production', 'staging')) {
    $schedule->command('emails:send')
        ->daily();
}
// Better
$schedule->command('emails:send')
        ->daily()
        ->onEnvironment(['production', 'staging']);
```

Tip 来自 [@nguyenduy4994](https://twitter.com/nguyenduy4994/status/1516960273000587265)

## 为自定义类添加可条件执行的行为

你可以使用 [Conditionable Trait](https://laravel.com/api/9.x/Illuminate/Support/Traits/Conditionable.html) 来避免使用 if / else，并支持方法链式调用。

```php
<?php

namespace App\Services;

use Illuminate\Support\Traits\Conditionable;

class MyService
{
    use Conditionable;

    // ...
}
```

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\MyRequest;
use App\Services\MyService;

class MyController extends Controller
{
    public function __invoke(MyRequest $request, MyService $service)
    {
        // Not good
        $service->addParam($request->param);

        if ($request->has('something')) {
            $service->methodToBeCalled();
        }

        $service->execute();
        // ---

        // Better
        $service->addParam($request->param)
            ->when($request->has('something'), fn ($service) => $service->methodToBeCalled())
            ->execute();
        // ---

        // ...
    }
}
```

## 当作业失败时执行操作

在某些情况下，我们希望在作业失败时执行一些操作，例如发送电子邮件或通知。

为此，我们可以在作业类中使用 `failed()` 方法，就像使用 `handle()` 方法一样：

```php
namespace App\Jobs\Invoice;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Throwable;

class CalculateSingleConsignment implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // ... __construct() method, handle() method, etc.

    public function failed(Throwable $exception)
    {
        // Perform any action here when job has failed
     }
}
```

Tip 来自 [@pauloimon](https://github.com/pauloimon)


## 作业失败时忽略数据库

如果你需要在作业失败时绕过数据库，可以执行以下操作之一来跳过数据库：
- 在 Laravel 8 及更高版本中，设置环境变量 `QUEUE_FAILED_DRIVER` 的值为 `null`。
- 在 `config/queue.php` 文件中将 `failed` 的值设置为 `null`，替换数组（如下所示）。此方法适用于 Laravel 7 及更早版本。

```php
    'failed' => null,
```

为什么要这样做呢？对于不需要存储失败作业且需要非常高的 TPS 的应用程序来说，跳过数据库可以非常有利，因为我们不会访问数据库，从而节省时间并防止数据库崩溃。

Tip 来自 [@a-h-abid](https://github.com/a-h-abid)

