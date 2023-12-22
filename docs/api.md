# API

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (日志和调试)](log-and-debug.md) ➡️ [下一条 (其他)](other.md)

## API 资源：是否包含 "data"？

如果你使用 Eloquent API 资源返回数据，它们将自动包装在 "data" 中。如果你想要移除它，请在 `app/Providers/AppServiceProvider.php` 中添加 `JsonResource::withoutWrapping()`;。

```php
class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        JsonResource::withoutWrapping();
    }
}
```

Tip 来自 [@phillipmwaniki](https://twitter.com/phillipmwaniki/status/1445230637544321029)

## 在 API 资源中条件性地计算关联关系的数量

你可以通过使用 whenCounted 方法，在资源响应中条件性地包含关联关系的计数。这样做可以避免在关系计数缺失时包含该属性。

```php
public function toArray($request)
{
     return [
          'id' => $this->id,
          'name' => $this->name,
          'email' => $this->email,
          'posts_count' => $this->whenCounted('posts'),
          'created_at' => $this->created_at,
          'updated_at' => $this->updated_at,
     ];
}
```

Tip 来自 [@mvpopuk](https://twitter.com/mvpopuk/status/1570480977507504128)

## API 返回 "Everything went ok"

如果你有一个执行某些操作但没有响应的 API 端点，因此你只想返回 "everything went ok"，你可以返回 204 状态码 "无内容"。在  Laravel 中，很容易实现：`return response()->noContent()`;。

```php
public function reorder(Request $request)
{
    foreach ($request->input('rows', []) as $row) {
        Country::find($row['id'])->update(['position' => $row['position']]);
    }

    return response()->noContent();
}
```

## 避免 API 资源中的 N+1 查询

你可以使用 `whenLoaded()` 方法来避免 API 资源中的 N+1 查询。

如果 Employee 模型中已加载了 department，则只会附加 department。

如果没有使用 `whenLoaded()` ，则总是会查询 department。

```php
class EmployeeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'fullName' => $this->full_name,
            'email' => $this->email,
            'jobTitle' => $this->job_title,
            'department' => DepartmentResource::make($this->whenLoaded('department')),
        ];
    }
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1473987501501071362)

## 从授权头部获取 Bearer 令牌

当你使用 API 并希望从授权头部访问令牌时，`bearerToken()` 函数非常方便。

```php
// Don't parse API headers manually like this:
$tokenWithBearer = $request->header('Authorization');
$token = substr($tokenWithBearer, 7);

//Do this instead:
$token = $request->bearerToken();
```

Tip 来自 [@iamharis010](https://twitter.com/iamharis010/status/1488413755826327553)

## 排序 API 结果

单列 API 排序，带有方向控制

```php
// Handles /dogs?sort=name and /dogs?sort=-name
Route::get('dogs', function (Request $request) {
    // Get the sort query parameter (or fall back to default sort "name")
    $sortColumn = $request->input('sort', 'name');

    // Set the sort direction based on whether the key starts with -
    // using Laravel's Str::startsWith() helper function
    $sortDirection = Str::startsWith($sortColumn, '-') ? 'desc' : 'asc';
    $sortColumn = ltrim($sortColumn, '-');

    return Dog::orderBy($sortColumn, $sortDirection)
        ->paginate(20);
});
```

对于多列排序（例如，?sort=name,-weight），我们做相同的处理：

```php
// Handles ?sort=name,-weight
Route::get('dogs', function (Request $request) {
    // Grab the query parameter and turn it into an array exploded by ,
    $sorts = explode(',', $request->input('sort', ''));

    // Create a query
    $query = Dog::query();

    // Add the sorts one by one
    foreach ($sorts as $sortColumn) {
        $sortDirection = Str::startsWith($sortColumn, '-') ? 'desc' : 'asc';
        $sortColumn = ltrim($sortColumn, '-');

        $query->orderBy($sortColumn, $sortDirection);
    }

    // Return
    return $query->paginate(20);
});
```
---

## 自定义 API 异常处理

### Laravel 8 及以下版本：

在 `App\Exceptions` 类的方法 `render()`:

```php
   public function render($request, Exception $exception)
    {
        if ($request->wantsJson() || $request->is('api/*')) {
            if ($exception instanceof ModelNotFoundException) {
                return response()->json(['message' => 'Item Not Found'], 404);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json(['message' => 'unAuthenticated'], 401);
            }

            if ($exception instanceof ValidationException) {
                return response()->json(['message' => 'UnprocessableEntity', 'errors' => []], 422);
            }

            if ($exception instanceof NotFoundHttpException) {
                return response()->json(['message' => 'The requested link does not exist'], 400);
            }
        }

        return parent::render($request, $exception);
    }
```

### Laravel 9 版本及以上:

`App\Exceptions` 类中有一个名为 `register()` 的方法。

```php
    public function register()
    {
        $this->renderable(function (ModelNotFoundException $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Item Not Found'], 404);
            }
        });

        $this->renderable(function (AuthenticationException $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'unAuthenticated'], 401);
            }
        });
        $this->renderable(function (ValidationException $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'UnprocessableEntity', 'errors' => []], 422);
            }
        });
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'The requested link does not exist'], 400);
            }
        });
    }
```

Tip 来自 [Feras Elsharif](https://github.com/ferasbbm)

---

## 强制 API 请求返回 JSON 响应

如果你构建了一个 API，并且在请求中没有包含 "Accept: application/JSON" 的 HTTP 头时遇到错误，那么错误将作为 HTML 或重定向响应返回到 API 路由上。为了避免这种情况，我们可以强制所有 API 响应返回 JSON。

第一步是通过运行以下命令创建中间件：

```console
php artisan make:middleware ForceJsonResponse
```

在 `App/Http/Middleware/ForceJsonResponse.php` 文件的 handle 方法中编写以下代码：

```php
public function handle($request, Closure $next)
{
    $request->headers->set('Accept', 'application/json');
    return $next($request);
}
```

第二步是在 app/Http/Kernel.php 文件中注册创建的中间件：

```php
protected $middlewareGroups = [        
    'api' => [
        \App\Http\Middleware\ForceJsonResponse::class,
    ],
];
```

Tip 来自 [Feras Elsharif](https://github.com/ferasbbm)

---

## API 版本控制

### 何时进行版本控制？

如果你正在开发一个可能在未来有多个发布版本的项目，或者你的 API 端点存在破坏性更改（例如响应数据格式的更改），并且你希望在代码发生更改时确保 API 版本保持可用。

### 更改默认的路由文件
第一步是在 `App\Providers\RouteServiceProvider` 文件中更改路由映射，让我们开始：

### Laravel 8 及以上版本：

添加一个 'ApiNamespace' 属性 

```php
/**
 * @var string
 *
 */
protected string $ApiNamespace = 'App\Http\Controllers\Api';
```

在 boot 方法中添加以下代码：

```php
$this->routes(function () {
     Route::prefix('api/v1')
        ->middleware('api')
        ->namespace($this->ApiNamespace.'\\V1')
        ->group(base_path('routes/API/v1.php'));
        }
    
    //for v2
     Route::prefix('api/v2')
            ->middleware('api')
            ->namespace($this->ApiNamespace.'\\V2')
            ->group(base_path('routes/API/v2.php'));
});
```


### Laravel 7 及以下版本：

添加一个 'ApiNamespace' 熟悉

```php
/**
 * @var string
 *
 */
protected string $ApiNamespace = 'App\Http\Controllers\Api';
```

在 map 方法中添加以下代码:

```php
// remove this $this->mapApiRoutes(); 
    $this->mapApiV1Routes();
    $this->mapApiV2Routes();
```

并添加以下方法：

```php
  protected function mapApiV1Routes()
    {
        Route::prefix('api/v1')
            ->middleware('api')
            ->namespace($this->ApiNamespace.'\\V1')
            ->group(base_path('routes/Api/v1.php'));
    }

  protected function mapApiV2Routes()
    {
        Route::prefix('api/v2')
            ->middleware('api')
            ->namespace($this->ApiNamespace.'\\V2')
            ->group(base_path('routes/Api/v2.php'));
    }
```

### 控制器文件夹版本控制

```
Controllers
└── Api
    ├── V1
    │   └──AuthController.php
    └── V2
        └──AuthController.php
```

### 路由文件版本控制

```
routes
└── Api
   │    └── v1.php     
   │    └── v2.php 
   └── web.php
```

Tip 来自 [Feras Elsharif](https://github.com/ferasbbm)
