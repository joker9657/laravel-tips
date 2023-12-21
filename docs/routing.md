# 路由

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (视图)](views.md) ➡️ [下一条 (表单验证)](validation.md)

## 在路由组中创建子组

在路由中，你可以在一个组内创建另一个组，只为 "父" 组中的某些 URL 分配特定的中间件。

```php
Route::group(['prefix' => 'account', 'as' => 'account.'], function() {
    Route::get('login', [AccountController::class, 'login']);
    Route::get('register', [AccountController::class, 'register']);
    Route::group(['middleware' => 'auth'], function() {
        Route::get('edit', [AccountController::class, 'edit']);
    });
});
```

## 在你的模型中声明一个 resolveRouteBinding 方法

Laravel 中的路由模型绑定非常棒，但有些情况下我们不能让用户通过 ID 轻易访问资源。我们可能需要验证他们对资源的所有权。

你可以在你的模型中声明一个 resolveRouteBinding 方法，并在其中添加你的自定义逻辑。

```php
public function resolveRouteBinding($value, $field = null)
{
     $user = request()->user();

     return $this->where([
          ['user_id' => $user->id],
          ['id' => $value]
     ])->firstOrFail();
}
```

Tip 来自 [@notdylanv](https://twitter.com/notdylanv/status/1567296232183447552/)

## 将 withTrashed() 方法分配给 Route::resource()

在 Laravel 9.35 之前 - 仅适用于 `Route::get()`

```php
Route::get('/users/{user}', function (User $user) {
     return $user->email;
})->withTrashed();
```

从 Laravel 9.35 开始 - 也适用于 `Route::resource()`!

```php
Route::resource('users', UserController::class)
     ->withTrashed();
```

或者，甚至可以按方法

```php
Route::resource('users', UserController::class)
     ->withTrashed(['show']);
```

## 跳过输入规范化

Laravel 会自动修剪请求中的所有输入字符串字段。这被称为输入规范化。

有时，你可能不希望这种行为。

你可以在 TrimStrings 中间件上使用 skipWhen 方法，并返回 true 来跳过它。

```php
public function boot()
{
     TrimStrings::skipWhen(function ($request) {
          return $request->is('admin/*);
     });
}
```

Tip 来自 [@Laratips1](https://twitter.com/Laratips1/status/1580210517372596224)

## 通配符子域名

你可以通过动态子域名创建路由组，并将其值传递给每个路由。

```php
Route::domain('{username}.workspace.com')->group(function () {
    Route::get('user/{id}', function ($username, $id) {
        //
    });
});
```

## 路由背后的内容是什么？

如果你使用 [Laravel UI package](https://github.com/laravel/ui), 你可能想知道 `Auth::routes()` 背后实际上是什么路由？

你可以查看文件 `/vendor/laravel/ui/src/AuthRouteMethods.php`.

```php
public function auth()
{
    return function ($options = []) {
        // Authentication Routes...
        $this->get('login', 'Auth\LoginController@showLoginForm')->name('login');
        $this->post('login', 'Auth\LoginController@login');
        $this->post('logout', 'Auth\LoginController@logout')->name('logout');
        // Registration Routes...
        if ($options['register'] ?? true) {
            $this->get('register', 'Auth\RegisterController@showRegistrationForm')->name('register');
            $this->post('register', 'Auth\RegisterController@register');
        }
        // Password Reset Routes...
        if ($options['reset'] ?? true) {
            $this->resetPassword();
        }
        // Password Confirmation Routes...
        if ($options['confirm'] ?? class_exists($this->prependGroupNamespace('Auth\ConfirmPasswordController'))) {
            $this->confirmPassword();
        }
        // Email Verification Routes...
        if ($options['verify'] ?? false) {
            $this->emailVerification();
        }
    };
}
```

函数默认使用如下:

```php
Auth::routes(); // no parameters
```

但你可以提供参数来启用或禁用某些路由：

```php
Auth::routes([
    'login'    => true,
    'logout'   => true,
    'register' => true,
    'reset'    => true,  // for resetting passwords
    'confirm'  => false, // for additional password confirmations
    'verify'   => false, // for email verification
]);
```

这个提示基于 [MimisK13](https://github.com/MimisK13) 的 [建议](https://github.com/LaravelDaily/laravel-tips/pull/57)

## 路由模型绑定：你可以定义一个键

你可以进行路由模型绑定，像 `Route::get('api/users/{user}', function (User $user) { … }` - 但不仅仅是通过 ID 字段。如果你想让 `{user}` 是一个 `username` 字段，把这个放在模型中：

```php
public function getRouteKeyName() {
    return 'username';
}
```

## 路由回退：当没有其他路由匹配时

如果你想为未找到的路由指定额外的逻辑，而不只是抛出默认的 404 页面，你可以在你的路由文件的最后创建一个特殊的路由。

```php
Route::group(['middleware' => ['auth'], 'prefix' => 'admin', 'as' => 'admin.'], function () {
    Route::get('/home', [HomeController::class, 'index']);
    Route::resource('tasks', [Admin\TasksController::class]);
});

// Some more routes....
Route::fallback(function() {
    return 'Hm, why did you land here somehow?';
});
```

## 用正则表达式进行路由参数验证

我们可以直接在路由中用 “where” 参数验证参数。一个相当典型的案例是在语言区域前缀你的路由，比如 `fr/blog` 和 `en/article/333`。我们如何确保那两个首字母不被用于其他语言？

`routes/web.php`:

```php
Route::group([
    'prefix' => '{locale}',
    'where' => ['locale' => '[a-zA-Z]{2}']
], function () {
    Route::get('/', [HomeController::class, 'index']);
    Route::get('article/{id}', [ArticleController::class, 'show']);;
});
```

## 速率限制：全局和游客 / 用户

你可以限制某个 URL 被调用的最大次数为每分钟60次，用 `throttle:60,1`：

```php
Route::middleware('auth:api', 'throttle:60,1')->group(function () {
    Route::get('/user', function () {
        //
    });
});
```

但是，你也可以为公众和已登录用户分别进行：

```php
// maximum of 10 requests for guests, 60 for authenticated users
Route::middleware('throttle:10|60,1')->group(function () {
    //
});
```

此外，你可以有一个 DB 字段 users.rate_limit 并限制特定用户的数量：

```php
Route::middleware('auth:api', 'throttle:rate_limit,1')->group(function () {
    Route::get('/user', function () {
        //
    });
});
```

## 将查询字符串参数传递给路由

如果你向路由传递额外的参数，在数组中，那些键 / 值对将自动添加到生成的 URL 的查询字符串中。

```php
Route::get('user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']); // Result: /user/1/profile?photos=yes
```

## 通过文件分离路由

如果你有一组与特定"部分"相关的路由，你可以将它们分离在一个特殊的 `routes/XXXXX.php` 文件中，并在 `routes/web.php` 中包含它

在 Taylor Otwell 自己的 [Laravel Breeze](https://github.com/laravel/breeze/blob/1.x/stubs/routes/web.php) 中的 `routes/auth.php` 例子：

```php
Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');

require __DIR__.'/auth.php';
```

然后，在 `routes/auth.php` 中:

```php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
// ... more controllers

use Illuminate\Support\Facades\Route;

Route::get('/register', [RegisteredUserController::class, 'create'])
                ->middleware('guest')
                ->name('register');

Route::post('/register', [RegisteredUserController::class, 'store'])
                ->middleware('guest');

// ... A dozen more routes
```

但是，只有当那个独立的路由文件具有相同的前缀/中间件设置时，你才应该使用这个 `include()`，否则最好在 `app/Providers/RouteServiceProvider` 中将它们分组：

```php
public function boot()
{
    $this->configureRateLimiting();

    $this->routes(function () {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/web.php'));

        // ... Your routes file listed next here
    });
}
```

## 翻译资源动词

如果你使用资源控制器，但出于 SEO 的目的想将 URL 动词更改为非英语，例如，你希望将 `/create` 更改为西班牙语的 `/crear`，你可以在 `App\Providers\RouteServiceProvider` 中使用 `Route::resourceVerbs()` 方法进行配置：

```php
public function boot()
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);

    // ...
}
```

## 自定义资源路由名称

当使用资源控制器时，在 `routes/web.php` 中，你可以指定 `->names()` 参数，因此浏览器中的 URL 前缀和你在整个 Laravel 项目中使用的路由名称前缀可能会不同。

```php
Route::resource('p', ProductController::class)->names('products');
```

因此，上述代码将生成像 `/p`, `/p/{id}`, `/p/{id}/edit` 等 URL.
但你可以使用 `route('products.index')`、`route('products.create')` 等在代码中调用它们。

## 预加载关系

如果你使用路由模型绑定，却认为无法对关系进行预加载，那就再想想。

你使用的路由模型绑定是这样的：

```php
public function show(Product $product) {
    //
}
```

但你有一个 belongsTo 关系，而不能使用 $product->with('category') 进行预加载？

其实你可以！通过 `->load()` 加载关系就可以了。

```php
public function show(Product $product) {
    $product->load('category');
    //
}
```

## 本地化资源 URI

如果你使用资源控制器，但希望将 URL 动词更改为非英语，比如你想把 `/create` 改为西班牙语的 `/crear`，你可以使用 `Route::resourceVerbs()` 方法进行配置。

```php
public function boot()
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
    //
}
```

## 资源控制器命名

在资源控制器中，在 `routes/web.php` 中，你可以指定 `->names()` 参数，因此 URL 前缀和路由名称前缀可能会不同。

这将生成像 `/p`、`/p/{id}`、`/p/{id}/edit` 等 URL。但你可以调用它们：

- route('products.index)
- route('products.create)
- etc

```php
Route::resource('p', \App\Http\Controllers\ProductController::class)->names('products');
```

## 轻松高亮你的导航栏菜单

使用 `Route::is('route-name')` 轻松高亮你的导航栏菜单

```blade
<ul>
    <li @if(Route::is('home')) class="active" @endif>
        <a href="/">Home</a>
    </li>
    <li @if(Route::is('contact-us')) class="active" @endif>
        <a href="/contact-us">Contact us</a>
    </li>
</ul>
```

Tip 来自 [@anwar_nairi](https://twitter.com/anwar_nairi/status/1443893957507747849)

## 使用 route() 助手生成绝对路径

```php
route('page.show', $page->id);
// http://laravel.test/pages/1

route('page.show', $page->id, false);
// /pages/1
```

Tip 来自 [@oliverds\_](https://twitter.com/oliverds_/status/1445796035742240770)

## 重写你的每个模型的路由绑定解析器

你可以重写你的每个模型的路由绑定解析器。在这个例子中，我无法控制 URL 中的 @ 符号，所以使用 `resolveRouteBinding` 方法，我可以移除 @ 符号并解析模型。

```php
// Route
Route::get('{product:slug}', Controller::class);

// Request
https://nodejs.pub/@unlock/hello-world

// Product Model
public function resolveRouteBinding($value, $field = null)
{
    $value = str_replace('@', '', $value);

    return parent::resolveRouteBinding($value, $field);
}
```

Tip 来自 [@Philo01](https://twitter.com/Philo01/status/1447539300397195269)

## 如果你需要公共 URL，但你希望它们是安全的

如果你需要公共 URL 但你希望它们是安全的，使用 Laravel 签名 URL

```php
class AccountController extends Controller
{
    public function destroy(Request $request)
    {
        $confirmDeleteUrl = URL::signedRoute('confirm-destroy', [
            $user => $request->user()
        ]);
        // Send link by email...
    }

    public function confirmDestroy(Request $request, User $user)
    {
        if (! $request->hasValidSignature()) {
            abort(403);
        }

        // User confirmed by clicking on the email
        $user->delete();

        return redirect()->route('home');
    }
}
```

Tip 来自 [@anwar_nairi](https://twitter.com/anwar_nairi/status/1448239591467589633)

## 在中间件方法中使用 Gate

你可以在中间件方法中使用在 `App\Providers\AuthServiceProvider` 中指定的 gates。

要做到这一点，你只需要在 `can:` 后面放上必要的 gate 的名字。

```php
Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

## 使用箭头函数的简单路由

你可以在路由中使用 php 的箭头函数，而不必使用匿名函数。

为此，你可以使用 `fn() =>`，它看起来更简单。

```php
// Instead of
Route::get('/example', function () {
    return User::all();
});

// You can
Route::get('/example', fn () => User::all());
```

## Route 视图

你可以使用 `Route::view($uri , $bladePage)` 直接返回一个视图，而不必使用控制器函数。

```php
//this will return home.blade.php view
Route::view('/home', 'home');
```

## 路由目录而非路由文件

你可以创建一个 /routes/web/ 目录，并且只在 /routes/web.php 填充:

```php
foreach(glob(dirname(__FILE__).'/web/*', GLOB_NOSORT) as $route_file){
    include $route_file;
}
```

现在， /routes/web/ 目录中的每个文件都可以作为 web 路由文件，你可以将你的路由组织到不同的文件中。

## 路由资源分组

如果你的路由有很多资源控制器，你可以将它们分组，并调用一个 Route::resources() ，而不是多个单独的 Route::resource() 语句。

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

## 自定义路由绑定

你知道你可以在 Laravel 中定义自定义路由绑定吗？

在这个例子中，我需要通过 slug 解析一个投资组合。但是 slug 不是唯一的，因为多个用户可以有一个名为 'Foo' 的投资组合。

所以我定义了 Laravel 应该如何从路由参数中解析它们。

```php
class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/dashboard';

    public function boot()
    {
        Route::bind('portfolio', function (string $slug) {
            return Portfolio::query()
                ->whereBelongsto(request()->user())
                ->whereSlug($slug)
                ->firstOrFail();
        });
    }
}
```

```php
Route::get('portfolios/{portfolio}', function (Portfolio $portfolio) {
    /*
     * The $portfolio will be the result of the query defined in the RouteServiceProvider
     */
})
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1496871240346509312)

## 检查路由名称的两种方式

这里有两种在 Laravel 中检查路由名称的方式。

```php
// #1
<a
    href="{{ route('home') }}"
    @class="['navbar-link', 'active' => Route::current()->getName() === 'home']"
>
    Home
</a>
// #2
<a
    href="{{ route('home') }}"
    @class="['navbar-link', 'active' => request()->routeIs('home)]"
>
    Home
</a>
```

Tip 来自 [@AndrewSavetchuk](https://twitter.com/AndrewSavetchuk/status/1510197418909999109)

## 路由模型绑定软删除模型

默认情况下，使用路由模型绑定不会检索已软删除的模型。
你可以通过在你的路由中使用 `withTrashed` 来改变这种行为。

```php
Route::get('/posts/{post}', function (Post $post) {
    return $post;
})->withTrashed();
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1511154599255703553)

## 检索没有查询参数的 URL

如果由于某种原因，你的 URL 有查询参数，你可以使用 request 的 `fullUrlWithoutQuery` 方法检索没有查询参数的 URL。

```php
// Original URL: https://www.amitmerchant.com?search=laravel&lang=en&sort=desc
$urlWithQueryString = $request->fullUrlWithoutQuery([
    'lang',
    'sort'
]);
echo $urlWithQueryString;
// Outputs: https://www.amitmerchant.com?search=laravel
```

Tip 来自 [@amit_merchant](https://twitter.com/amit_merchant/status/1510867527962066944)

## 自定义路由模型绑定中缺失模型的行为

默认情况下，当 Laravel无 法绑定模型时，会抛出一个 404 错误，但你可以通过向 missing 方法传递一个闭包来改变这种行为。

```php
Route::get('/users/{user}', [UsersController::class, 'show'])
    ->missing(function ($parameters) {
        return Redirect::route('users.index');
    });
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1511322007576608769)

## 从路由中排除中间件

你可以使用 withoutMiddleware 方法在 Laravel 的路由级别排除中间件。

```php
Route::post('/some/route', SomeController::class)
    ->withoutMiddleware([VerifyCsrfToken::class]);
```

Tip 来自 [@alexjgarrett](https://twitter.com/alexjgarrett/status/1512529798790320129)

## 控制器组

考虑使用路由控制器组，而不是在每个路由中使用控制器。这个功能自 Laravel v8.80 版本开始添加。

```php
// Before
Route::get('users', [UserController::class, 'index']);
Route::post('users', [UserController::class, 'store']);
Route::get('users/{user}', [UserController::class, 'show']);
Route::get('users/{user}/ban', [UserController::class, 'ban']);
// After
Route::controller(UsersController::class)->group(function () {
    Route::get('users', 'index');
    Route::post('users', 'store');
    Route::get('users/{user}', 'show');
    Route::get('users/{user}/ban', 'ban');
});
```

Tip 来自 [@justsanjit](https://twitter.com/justsanjit/status/1514943541612527616)

