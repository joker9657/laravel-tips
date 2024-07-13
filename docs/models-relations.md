# 模型关联

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (DB 模型和 Eloquent)](db-models-and-eloquent.md) ➡️ [下一条 (迁移)](migrations.md)

## 在 Eloquent 关联中排序

你可以直接在 Eloquent 关联上使用 `orderBy()` 来指定排序顺序。

```php
public function products()
{
    return $this->hasMany(Product::class);
}

public function productsByName()
{
    return $this->hasMany(Product::class)->orderBy('name');
}
```

## 多对多关联添加 where 语句

在你的多对多关联中，你可以使用 `wherePivot` 方法向关联的中间表添加 where 语句。

```php
class Developer extends Model
{
     // Get all clients related to this developer
     public function clients()
     {
          return $this->belongsToMany(Clients::class);
     }

     // Get only local clients
     public function localClients()
     {
          return $this->belongsToMany(Clients::class)
               ->wherePivot('is_local', true);
     }
}
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1582904416457269248)

## 获取另一个关联的最新或最老的项目

自 Laravel 8.42 起，在 Eloquent 模型中，你可以定义一个关系，用于获取另一个关系中最新（或最旧）的项目。

```php
/**
 * Get the user's latest order.
 */
public function latestOrder()
{
    return $this->hasOne(Order::class)->latestOfMany();
}

/**
 * Get the user's oldest order.
 */
public function oldestOrder()
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

## 条件关系

如果你注意到自己经常在同一个关系上使用额外的 “where” 条件，你可以创建一个单独的关系方法。

模型类:

```php
public function comments()
{
    return $this->hasMany(Comment::class);
}

public function approvedComments()
{
    return $this->comments()->where('approved', 1);
}

```

## 原始数据库查询: havingRaw()

你可以在各个地方使用原始的数据库查询，包括在 `groupBy()` 后使用 `havingRaw()` 函数。

```php
Product::groupBy('category_id')->havingRaw('COUNT(*) > 1')->get();
```

## 更深入的 Eloquent has()

你可以使用 Eloquent 的 `has()` 函数来查询关系，甚至可以查询两层深的关系！

```php
// Author -> hasMany(Book::class);
// Book -> hasMany(Rating::class);
$authors = Author::has('books.ratings')->get();
```

## hasMany()关系中，可以精确过滤具有特定数量子记录的记录

在 Eloquent 的 `hasMany()` 关系中，你可以过滤掉具有 X 个子记录的记录。

```php
// Author -> hasMany(Book::class)
$authors = Author::has('books', '>', 5)->get();
```

## 默认模型

你可以在 `belongsTo` 关系中分配一个默认模型，以避免在调用 <code v-pre>{{ $post->user->name }}</code> 时出现致命错误，如果 `$post->user` 不存在的话。

```php
public function user()
{
    return $this->belongsTo(User::class)->withDefault();
}
```

## 使用 hasMany 创建多个

如果你有 `hasMany()` 关系，可以使用 `saveMany()` 一次性从“父”对象保存多个“子”条目。

```php
$post = Post::find(1);
$post->comments()->saveMany([
    new Comment(['message' => 'First comment']),
    new Comment(['message' => 'Second comment']),
]);
```

## 多级预加载

在Laravel中，你可以在一个语句中预加载多个级别，例如，我们不仅加载作者关系，还加载作者模型上的国家关系。

```php
$users = Book::with('author.country')->get();
```

## 精确指定列的预加载

你可以进行Laravel预加载并指定要从关系中获取的精确列。

```php
$users = Book::with('author:id,name')->get();
```

你甚至可以在更深层的第二级关系中进行指定：

```php
$users = Book::with('author.country:id,name')->get();
```

## 轻松触发父级的 updated_at

如果你正在更新一条记录，并希望更新父关系的 `updated_at` 列（例如，你添加了新的帖子评论，并希望 `posts.updated_at` 更新），只需在子模型上使用 `$touches = ['post'];` 属性。

```php
class Comment extends Model
{
    protected $touches = ['post'];
}
```

## 始终检查关系是否存在

绝对**不要**在没有检查关系对象是否存在的情况下使用 `$model->relationship->field`。

它可能因为各种原因被删除，例如在你的代码之外，由其他人的队列作业等。在Blade中使用 `if-else` 或 <code v-pre>{{ $model->relationship->field ?? '' }}</code>，或者使用 <code v-pre>{{ optional($model->relationship)->field }}</code>。在 php8 中，你甚至可以使用 nullsafe 运算符 <code v-pre>{{ $model->relationship?->field) }}</code>。

## 使用 withCount() 计算子关系记录

如果你有 `hasMany()` 关系，并且想计算“子”条目，不要编写特殊的查询。例如，如果你的 User 模型上有帖子和评论，可以这样写 `withCount()`：

```php
public function index()
{
    $users = User::withCount(['posts', 'comments'])->get();
    return view('users', compact('users'));
}
```

然后，在你的 Blade 文件中，你可以通过 `{relationship}_count` 属性访问这些数字：

```php
@foreach ($users as $user)
<tr>
    <td>{ { $user->name } }</td>
    <td class="text-center">{ { $user->posts_count } }</td>
    <td class="text-center">{ { $user->comments_count } }</td>
</tr>
@endforeach
```

你也可以按该字段排序:

```php
User::withCount('comments')->orderBy('comments_count', 'desc')->get();
```

## 关联关系的额外过滤查询

如果你想加载关系数据，可以在闭包函数中指定一些限制或排序。例如，如果你想获取每个国家的三个最大城市，可以使用以下代码：

```php
$countries = Country::with(['cities' => function($query) {
    $query->orderBy('population', 'desc');
}])->get();
```

## 动态加载关系

你不仅可以指定在模型中始终加载哪些关系，还可以在构造函数中动态加载关系：

```php
class ProductTag extends Model
{
    protected $with = ['product'];

    public function __construct() {
        parent::__construct();
        $this->with = ['product'];

        if (auth()->check()) {
            $this->with[] = 'user';
        }
    }
}
```

## 使用 hasMany 替代 belongsTo

对于 `belongsTo` 关系，在创建子记录时，可以使用 `hasMany` 关系来简化语句。

```php
// if Post -> belongsTo(User), and User -> hasMany(Post)...
// Then instead of passing user_id...
Post::create([
    'user_id' => auth()->id(),
    'title' => request()->input('title'),
    'post_text' => request()->input('post_text'),
]);

// Do this
auth()->user()->posts()->create([
    'title' => request()->input('title'),
    'post_text' => request()->input('post_text'),
]);
```

## 重命名中间表

如果你想将 "pivot" 一词重命名，并使用其他名称来调用你的关系，只需在关系中使用 `->as('name')`。

模型:

```php
public function podcasts() {
    return $this->belongsToMany(Podcast::class)
        ->as('subscription')
        ->withTimestamps();
}
```

控制器:

```php
$podcasts = $user->podcasts();
foreach ($podcasts as $podcast) {
    // instead of $podcast->pivot->created_at ...
    echo $podcast->subscription->created_at;
}
```

## 一行中更新父模型

如果你有一个 `belongsTo()` 关系，可以在同一条语句中更新 Eloquent 关系数据：

```php
// if Project -> belongsTo(User::class)
$project->user->update(['email' => 'some@gmail.com']);
```

## Laravel 7+ 外键

从 Laravel 7 开始，在迁移中，你不需要为关系字段编写两行代码 - 一行用于字段，一行用于外键。可以使用 `foreignId()` 方法。

```php
// Before Laravel 7
Schema::table('posts', function (Blueprint $table)) {
    $table->unsignedBigInteger('user_id');
    $table->foreign('user_id')->references('id')->on('users');
}

// From Laravel 7
Schema::table('posts', function (Blueprint $table)) {
    $table->foreignId('user_id')->constrained();
}

// Or, if your field is different from the table reference
Schema::table('posts', function (Blueprint $table)) {
    $table->foreignId('created_by_id')->constrained('users', 'column');
}
```

## 结合两个 "whereHas"

在 Eloquent 中, 你可以在一条语句中结合使用 `whereHas()` 和 `orDoesntHave()`。

```php
User::whereHas('roles', function($query) {
    $query->where('id', 1);
})
->orDoesntHave('roles')
->get();
```

## 检查关联方法是否存在


如果你的 Eloquent 关系名称是动态的，并且你需要检查对象上是否存在具有该名称的关系，请使用 PHP 函数 `method_exists($object, $methodName)`。

```php
$user = User::first();
if (method_exists($user, 'roles')) {
    // Do something with $user->roles()->...
}
```

## 带有额外关联的中间表

在多对多关系中，你的中间表可能包含额外的字段，甚至与其他模型之间建立额外的关联。

然后，生成一个单独的 Pivot 模型：

```bash
php artisan make:model RoleUser --pivot
```

接下来，在 `belongsToMany()` 中使用 `->using()` 方法指定它。然后你可以像示例中那样进行操作。

```php
// in app/Models/User.php
public function roles()
{
    return $this->belongsToMany(Role::class)
        ->using(RoleUser::class)
        ->withPivot(['team_id']);
}

// app/Models/RoleUser.php: notice extends Pivot, not Model
use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}

// Then, in Controller, you can do:
$firstTeam = auth()->user()->roles()->first()->pivot->team->name;
```

## 实时加载计数

除了 Eloquent 的 `withCount()` 方法用于计算相关记录的数量之外，你还可以使用 `loadCount()` 方法实时加载计数：

```php
// if your Book hasMany Reviews...
$book = Book::first();

$book->loadCount('reviews');
// Then you get access to $book->reviews_count;

// Or even with extra condition
$book->loadCount(['reviews' => function ($query) {
    $query->where('rating', 5);
}]);
```

## 随机排序关联关系

你可以使用 `inRandomOrder()` 方法随机排序 Eloquent 查询结果，还可以用它来随机排序查询中加载的**关联**条目。
You can use `inRandomOrder()` to randomize Eloquent query result, but also you can use it to randomize the **relationship** entries you're loading with query.

```php
// If you have a quiz and want to randomize questions...

// 1. If you want to get questions in random order:
$questions = Question::inRandomOrder()->get();

// 2. If you want to also get question options in random order:
$questions = Question::with(['answers' => function($q) {
    $q->inRandomOrder();
}])->inRandomOrder()->get();
```

## 过滤 hasMany 关联关系

这是我项目中的一个代码示例，展示了过滤 hasMany 关联关系的可能性。

TagTypes -> hasMany Tags -> hasMany Examples

你想查询所有类型及其标签，但仅包括具有示例的标签，并按示例最多的方式排序。

```php
$tag_types = TagType::with(['tags' => function ($query) {
    $query->has('examples')
        ->withCount('examples')
        ->orderBy('examples_count', 'desc');
    }])->get();
```

## 根据多对多关系的中间表列进行筛选

如果你有一个多对多关系，并在中间表中添加了额外的列，以下是在查询列表时如何按此列排序的方法。

```php
class Tournament extends Model
{
    public function countries()
    {
        return $this->belongsToMany(Country::class)->withPivot(['position']);
    }
}
```

```php
class TournamentsController extends Controller
{
    public function whatever_method() {
        $tournaments = Tournament::with(['countries' => function($query) {
            $query->orderBy('position');
        }])->latest()->get();
    }
}
```

## 更简洁的 whereHas 写法

在 Laravel 8.57 中发布：使用简单条件在 whereHas() 中更简洁的写法。

```php
// Before
User::whereHas('posts', function ($query) {
    $query->where('published_at', '>', now());
})->get();

// After
User::whereRelation('posts', 'published_at', '>', now())->get();
```

## 你可以为关联关系添加条件

```php
class User
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // with a getter
    public function getPublishedPostsAttribute()
    {
        return $this->posts->filter(fn ($post) => $post->published);
    }

    // with a relationship
    public function publishedPosts()
    {
        return $this->hasMany(Post::class)->where('published', true);
    }
}
```

Tip 来自 [@anwar_nairi](https://twitter.com/anwar_nairi/status/1441718371335114756)

## 新的 `whereBelongsTo()` Eloquent 查询构建器方法

Laravel 8.63.0 引入了新的 `whereBelongsTo()` Eloquent 查询构建器方法。😍

这使你可以从查询中删除 BelongsTo 外键名称，并将关联方法作为唯一的真实来源！

```php
// From:
$query->where('author_id', $author->id)

// To:
$query->whereBelongsTo($author)

// Easily add more advanced filtering:
Post::query()
    ->whereBelongsTo($author)
    ->whereBelongsTo($cateogry)
    ->whereBelongsTo($section)
    ->get();

// Specify a custom relationship:
$query->whereBelongsTo($author, 'author')
```

Tip 来自 [@danjharrin](https://twitter.com/danjharrin/status/1445406334405459974)

##  `is()` 方法用于比较一对一关联模型

现在我们可以在不进行进一步数据库访问的情况下比较相关模型。

```php
// BEFORE: the foreign key is taken from the Post model
$post->author_id === $user->id;

// BEFORE: An additional request is made to get the User model from the Author relationship
$post->author->is($user);

// AFTER
$post->author()->is($user);
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## `whereHas()` 多个连接

```php
// User Model
class User extends Model
{
    protected $connection = 'conn_1';

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// Post Model
class Post extends Model
{
    protected $connection = 'conn_2';

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

// wherehas()
$posts = Post::whereHas('user', function ($query) use ($request) {
      $query->from('db_name_conn_1.users')->where(...);
  })->get();
```

Tip 来自 [@adityaricki](https://twitter.com/adityaricki2)

## 更新现有的中间表记录

如果要更新表中的现有中间表记录，请使用 `updateExistingPivot` 而不是 `syncWithPivotValues`。

```php
// Migrations
Schema::create('role_user', function ($table) {
    $table->unsignedId('user_id');
    $table->unsignedId('role_id');
    $table->timestamp('assigned_at');
})

// first param for the record id
// second param for the pivot records
$user->roles()->updateExistingPivot(
    $id, ['assigned_at' => now()],
);
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1461414850341621760)

## 获取最新（或最旧）的项目的关联

在 Laravel 8.42 中新增的功能：在 Eloquent 模型中，可以定义一个关联，用于获取另一个关联的最新（或最旧）项目。

```php
public function historyItems(): HasMany
{
    return $this
        ->hasMany(ApplicationHealthCheckHistoryItem::class)
        ->orderByDesc('created_at');
}

public function latestHistoryItem(): HasOne
{
    return $this
        ->hasOne(ApplicationHealthCheckHistoryItem::class)
        ->latestOfMany();
}
```

## 使用 ofMany 替代自定义查询

```php
class User extends Authenticable {
    // Get most popular post of user
    public function mostPopularPost() {
        return $this->hasOne(Post::class)->ofMany('like_count', 'max');
    }
}
```

Tip 来自 [@LaravelEloquent](https://twitter.com/LaravelEloquent/status/1493324310328578054)

## 在关联上使用 orWhere 时避免数据泄漏

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

返回：返回所有投票大于或等于100的帖子

```sql
select * from posts where user_id = ? and active = 1 or votes >= 100
```

```php
use Illuminate\Database\Eloquent\Builder;

$users->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
                    ->orWhere('votes', '>=', 100);
    })
    ->get();
```

返回：返回投票大于或等于100的用户帖子

```sql
select * from posts where user_id = ? and (active = 1 or votes >= 100)
```

Tip 来自 [@BonnickJosh](https://twitter.com/BonnickJosh/status/1494779780562096139)
