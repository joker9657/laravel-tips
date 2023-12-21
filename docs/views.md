# Views

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (迁移)](migrations.md) ➡️ [下一条 (路由)](routing.md)

## foreach 循环中使用 $loop 变量

在 foreach 循环内部，可以通过使用 `$loop` 变量来检查当前条目是否是第一个或最后一个。

```blade
@foreach ($users as $user)
     @if ($loop->first)
        This is the first iteration.
     @endif

     @if ($loop->last)
        This is the last iteration.
     @endif

     <p>This is user {{ $user->id }}</p>
@endforeach
```

还有其他属性，如 `$loop->iteration` 或 `$loop->count`.
在 [官方文档](https://laravel.com/docs/master/blade#the-loop-variable) 中了解信息。

## 使用 Blade 生成更多 HTML

你可以使用 Blade 生成任何你想要的动态字符串或文件，例如 shell 脚本或站点地图文件。

你只需要在视图上调用 `render()` 方法，就可以将结果作为字符串获取。

```php
$script = view('deploy-script')->render();

$ssh = $this->createSshConnection();

info("Executing deploy script...");
$process = $ssh->execute(explode("\n", $script));
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1566620670888275968/)

## Blade 组件的简短属性语法

从 Laravel 9.32 开始可用。

当前语法:
```blade
<x-profile :user-id="$userId"></x-profile>
```

简短语法:
```blade
<x-profile :$userId></x-profile>
```

## 将一个变量与多个视图共享

你是否曾经需要将一个变量与 Laravel 中的多个视图共享？这里有一个简单的解决方案。

```php
use App\Models\Post;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        if (Schema::hasTable('posts')) {
            View::share('recentPosts', Post::latest()->take(3)->get());
        }
    }
}
```

Tip 来自 [@codewithdary](https://twitter.com/codewithdary)

## 检查视图文件是否存在?

你可以在实际加载视图之前检查视图文件是否存在。

```php
if (view()->exists('custom.page')) {
 // Load the view
}
```

你甚至可以加载一个视图数组，只有第一个存在的视图将被实际加载。

```php
return view()->first(['custom.dashboard', 'dashboard'], $data);
```

## 错误码的 Blade 页面

如果你想为某个 HTTP 状态码创建一个特定的错误页面，比如 503 - 只需在 `resources/views/errors/503.blade.php` 或 `403.blade.php` 等位置创建一个具有该代码的 Blade 文件，它将在出现该错误码时自动加载。

## 不使用控制器的视图

如果你希望路由只显示特定的视图，而不创建控制器方法，只需使用 `Route::view()` 函数。

```php
// Instead of this
Route::get('about', 'TextsController@about');
// And this
class TextsController extends Controller
{
    public function about()
    {
        return view('texts.about');
    }
}
// Do this
Route::view('about', 'texts.about');
```

## Blade @auth

使用 `@auth` 指令而不是 if 语句来检查已登录的用户。

典型方式:

```blade
@if(auth()->user())
    // The user is authenticated.
@endif
```

简短方式:

```blade
@auth
    // The user is authenticated.
@endauth
```

与之相反的是 `@guest` 指令:

```blade
@guest
    // The user is not authenticated.
@endguest
```

## Blade 中的两级 $loop 变量

在 Blade 的 foreach 中，你甚至可以在两级循环中使用 $loop 变量来访问父变量。

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

## 创建你自己的 Blade 指令

非常简单 - 只需在 `app/Providers/AppServiceProvider.php` 中添加你自己的方法。例如，如果你想替换 `<br>` 标签为新的行：

```blade
<textarea>@br2nl($post->post_text)</textarea>
```

在 AppServiceProvider 的 `boot()` 方法中添加这个指令：

```php
public function boot()
{
    Blade::directive('br2nl', function ($string) {
        return "<?php echo preg_replace('/\<br(\s*)?\/?\>/i', \"\n\", $string); ?>";
    });
}
```

## Blade 指令: IncludeIf, IncludeWhen, IncludeFirst

如果你不确定你的 Blade 部分文件是否真的存在，你可以使用这些条件命令：

只有在 Blade 文件存在时才加载 header

```blade
@includeIf('partials.header')
```

只有对角色ID为1的用户加载 header

```blade
@includeWhen(auth()->user()->role_id == 1, 'partials.header')
```

尝试加载 adminlte.header，如果不存在 - 将加载 default.header

```blade
@includeFirst('adminlte.header', 'default.header')
```

## 使用 Laravel Blade-X 变量绑定来节省更多空间

```blade
// Using include, the old way
@include("components.post", ["title" => $post->title])

// Using Blade-X
<x-post link="{{ $post->title }}" />

// Using Blade-X variable binding
<x-post :link="$post->title" />
```

Tip 来自 [@anwar_nairi](https://twitter.com/anwar_nairi/status/1442441888787795970)

## Blade 组件属性

```blade
// button.blade.php
@props(['rounded' => false])

<button {{ $attributes->class([
    'bg-red-100 text-red-800',
    'rounded' => $rounded
    ]) }}>
    {{ $slot }}
</button>

// view.blade.php
// Non-rounded:
<x-button>Submit</x-button>

// Rounded:
<x-button rounded>Submit</x-button>
```

Tip 来自 [@godismyjudge95](https://twitter.com/godismyjudge95/status/1448825909167931396)

## Blade 自动完成类型提示

```blade
@php
    /* @var App\Models\User $user */
@endphp

<div>
    // your ide will typehint the property for you
    {{$user->email}}
</div>
```

Tip 来自 [@freekmurze](https://twitter.com/freekmurze/status/1455466663927746560)

## 组件语法提示

你知道吗，如果你在组件参数前传递冒号 (:)，你可以直接传递变量而无需打印语句 `{{ }}`？

```blade
<x-navbar title="{{ $title }}"/>

// you can do instead

<x-navbar :title="$title"/>
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1457056634363072520)

## 自动高亮导航链接

当URL完全匹配时自动高亮导航链接，或者传递路径或路由名称模式。

一个带有请求和 CSS 类助手的 Blade 组件使得显示活动 / 非活动状态变得非常简单。 

```php
class NavLink extends Component
{
    public function __construct($href, $active = null)
    {
        $this->href = $href;
        $this->active = $active ?? $href;
    }

    public function render(): View
    {
        $classes = ['font-medium', 'py-2', 'text-primary' => $this->isActive()];

        return view('components.nav-link', [
            'class' => Arr::toCssClasses($classes);
        ]);
    }

    protected function isActive(): bool
    {
        if (is_bool($this->active)) {
            return $this->active;
        }

        if (request()->is($this->active)) {
            return true;
        }

        if (request()->fullUrlIs($this->active)) {
            return true;
        }

        return request()->routeIs($this->active);
    }
}
```

```blade
<a href="{{ $href }}" {{ $attributes->class($class) }}>
    {{ $slot }}
</a>
```

```blade
<x-nav-link :href="route('projects.index')">Projects</x-nav-link>
<x-nav-link :href="route('projects.index')" active="projects.*">Projects</x-nav-link>
<x-nav-link :href="route('projects.index')" active="projects/*">Projects</x-nav-link>
<x-nav-link :href="route('projects.index')" :active="$tab = 'projects'">Projects</x-nav-link>
```

Tip 来自 [@mpskovvang](https://twitter.com/mpskovvang/status/1459646197635944455)

## 清理循环

你知道 Blade 的 `@each` 指令可以帮助清理模板中的循环吗？

```blade
// good
@foreach($item in $items)
    <div>
        <p>Name: {{ $item->name }}
        <p>Price: {{ $item->price }}
    </div>
@endforeach

// better (HTML extracted into partial)
@each('partials.item', $items, 'item')
```

Tip 来自 [@kirschbaum_dev](https://twitter.com/kirschbaum_dev/status/1463205294914297861)

## 简单的方式整理你的 Blade 视图

整理你的 Blade 视图的简单方式！

使用 `forelse 循环`，而不是嵌套在 if 语句中的 `foreach 循环`

```blade
<!-- if/loop combination -->
@if ($orders->count())
    @foreach($orders as $order)
        <div>
            {{ $order->id }}
        </div>
    @endforeach
@else
    <p>You haven't placed any orders yet.</p>
@endif

<!-- Forelse alternative -->
@forelse($orders as $order)
    <div>
        {{ $order->id }}
    </div>
@empty
    <p>You haven't placed any orders yet.</p>
@endforelse
```

Tip 来自 [@alexjgarrett](https://twitter.com/alexjgarrett/status/1465674086022107137)

## Checked blade 指令

在 Laravel 9 中，你将能够使用新的 "checked" Blade指令。

这将是我们可以用来稍微清理我们的 Blade 视图的一个很好的添加

```blade
// Before Laravel 9:
<input type="radio" name="active" value="1" {{ old('active', $user->active) ? 'checked' : '' }}/>
<input type="radio" name="active" value="0" {{ old('active', $user->active) ? '' : 'checked' }}/>

// Laravel 9
<input type="radio" name="active" value="1" @checked(old('active', $user->active))/>
<input type="radio" name="active" value="0" @checked(!old('active', $user->active))/>
```

Tip 来自 [@AshAllenDesign](https://twitter.com/AshAllenDesign/status/1489567000812736513)

## Selected blade 指令

在 Laravel 9 中，你将能够使用新的 "selected" Blade指令用于 HTML 选择元素。

这将是我们可以用来稍微清理我们的 Blade 视图的一个很好的添加

```blade
// Before Laravel 9:
<select name="country">
    <option value="India" {{ old('country') ?? $country == 'India' ? 'selected' : '' }}>India</option>
    <option value="Pakistan" {{ old('country') ?? $country == 'Pakistan' ? 'selected' : '' }}>Pakistan</option>
</select>

// Laravel 9
<select name="country">
    <option value="India" @selected(old('country') ?? $country == 'India')>India</option>
    <option value="Pakistan" @selected(old('country') ?? $country == 'Pakistan')>Pakistan</option>
</select>
```

Tip 来自 [@VijayGoswami](https://vijaygoswami.in)

