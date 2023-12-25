# DB 模型和 Eloquent

⬆️ [回到主页](README.md#laravel-tips) ➡️ [下一条 (模型关联)](models-relations.md)

## 重用或克隆查询

通常，我们需要从筛选的查询中多次查询。所以，大多数时候我们使用 `query()` 方法，让我们编写一个获取今天创建的活跃和非活跃产品的查询

```php

$query = Product::query();


$today = request()->q_date ?? today();
if($today){
    $query->where('created_at', $today);
}

// lets get active and inactive products
$active_products = $query->where('status', 1)->get(); // this line modified the $query object variable
$inactive_products = $query->where('status', 0)->get(); // so here we will not find any inactive products
```
但是，在获得 `$active_products` 后，`$query` 将被修改。因此，`$inactive_products` 不会从 `$query`中找到任何非活跃产品，并且每次都会返回空白集合。因为，这将尝试从 `$active_products` 中查找非活跃产品（`$query` 将仅返回活跃产品）。

为了解决这个问题，我们可以通过克隆这个 `$query` 对象来多次查询。因此，我们需要在执行任何 `$query` 修改操作之前克隆此 `$query`。

```php
$active_products = $query->clone()->where('status', 1)->get(); // it will not modify the $query
$inactive_products = $query->clone()->where('status', 0)->get(); // so we will get inactive products from $query

```

## 请记得在原始查询中使用绑定

可以将绑定数组传递给大多数原始查询方法，以避免 SQL 注入。

```php
// This is vulnerable to SQL injection
$fullname = request('full_name');
User::whereRaw("CONCAT(first_name, last_name) = $fullName")->get();

// Use bindings
User::whereRaw("CONCAT(first_name, last_name) = ?", [request('full_name')])->get();
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1565806352219328513)

## 在 MySQL 上使用 Laravel 的全文搜索的小备忘单

迁移
```php
Schema::create('comments', function (Blueprint $table) {
     $table->id();
     $table->string('title');
     $table->text('description');

     $table->fullText(['title', 'description']);
});
```

自然语言

搜索 `something`
```php
Comment::whereFulltext(['title', 'description'], 'something')->get();
```

具有查询扩展功能的自然语言

搜索 `something` 并使用搜索结果来执行更大的查询。

```php
Comment::whereFulltext(['title', 'description'], 'something', ['expanded' => true])->get();
```

布尔模式

搜索 `something` 和排除 `else`

```php
Comment::whereFulltext(['title', 'description'], '+something -else', ['mode' => 'boolean'])->get();
```

Tip 来自 [@w3Nicolas](https://twitter.com/w3Nicolas/status/1566694849767772160/)

## 合并 eloquent 集合

Eloquent 集合的 merge 方法使用 id 来避免重复的模型。

但是，如果你要合并具有不同模型的集合，这可能会导致意料之外的结果。

相反，可以使用基本的集合方法来解决这个问题。

```php
$videos = Video::all();
$images = Image::all();

// If there are videos with the same id as images they will get replaced
// You'll end up with missing videos
$allMedia = $videos->merge($images);

// call `toBase()` in your eloquent collection to use the base merge method instead
$allMedia = $videos->toBase()->merge($images);
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1568392184772296706)

## 在不修改 updated_at 字段的情况下执行操作

如果你想在模型没有修改 `updated_at` 时间戳的情况下执行模型操作，你可以在传递给 `withoutTimestamps` 方法的闭包中操作模型。

从 Laravel 9.31 版本开始可用。

```php
$user = User::first();

// `updated_at` is not changed...

User::withoutTimestamps(
     fn () => $user->update(['reserved_at' => now()])
);
```

Tip 来自 [@LaravelEloquent](https://twitter.com/LaravelEloquent/status/1573787406528126976)

## 你可以编写具备事务感知的代码。

使用 `DB::afterCommit` 方法，你可以编写只有在事务提交时才执行的代码，如果事务回滚，则代码将被丢弃。

如果没有事务存在，代码将立即执行。
```php
DB::transaction(function () {
     $user = User::create([...]);

     $user->teams()->create([...]);
});
```

```php
class User extends Model
{
     protected static function booted()
     {
          static::created(function ($user) {
               // Will send the email only if the
               // transaction is committed
               DB::afterCommit(function () use ($user) {
                    Mail::send(new WelcomeEmail($user));
               });
          });
     }
}
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1583960872602390528)

## 在其他关联关系中使用 Eloquent 作用域

你知道可以在定义其他关联关系时使用 Eloquent 作用域吗？

**app/Models/Lesson.php**:
```php
public function scopePublished($query)
{
     return $query->where('is_published', true);
}
```

**app/Models/Course.php**:
```php
public function lessons(): HasMany
{
     return $this->hasMany(Lesson::class);
}

public function publishedLessons(): HasMany
{
     return $this->lessons()->published();
}
```

## 自 Laravel 9.37 起新的 `rawValue()` 方法

Laravel 9.37 推出了一个新的 `rawValue()` 方法，用于从 SQL 表达式中获取值。以下是一些来自拉取请求的示例：
```php
$first = TripModel::orderBy('date_at', 'ASC')
     ->rawValue('YEAR(`date_at`)');
$last = TripModel::orderBy('date_at', 'DESC')
     ->rawValue('YEAR(`date_at`)');

$fullname = UserModel::where('id', $id)
     ->rawValue('CONCAT(`first_name`, " ", `last_name`)');
```

Tip 来自 [@LoydRG](https://twitter.com/LoydRG/status/1587689148768567298)

## 当目标值是整数时，加快数据加载速度。

当目标值为整数时，不要使用 **whereIn()** 方法加载大范围的数据，使用 **whereIntegerInRaw()** 比 **whereIn()** 快。

```php
// instead of using whereIn
Product::whereIn('id', range(1, 50))->get();

// use WhereIntegerInRaw method for faster loading
Product::whereIntegerInRaw('id', range(1, 50))->get();
```

Tip 来自 [@LaraShout](https://twitter.com/LaraShout)

## 加载两个时间戳之间已完成的数据

使用 **whereBetween** 在两个时间戳之间加载记录，可以使用空合并运算符 (??) 传递回退值。

```php
// Load tasks completed between two timestamps
Task::whereBetween('completed_at', [
    $request->from ?? '2023-01-01',
    $request->to ??  today()->toDateTimeString(),
]);
```

Tip 来自 [@LaraShout](https://twitter.com/LaraShout)

## 传入原始查询对结果排序

你可以通过传递原始查询来对结果进行排序。

例如，通过按照任务完成之前的截止日期进行排序。

```php
// Sort tasks by the task was completed before the due date
$tasks = Task::query()
    ->whereNotNull('completed_at')
    ->orderByRaw('due_at - completed_at DESC')
    ->get();
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo)

## Eloquent 日期方法

在Eloquent中，可以使用以下函数来检查日期：`whereDay()`、`whereMonth()`、`whereYear()`、`whereDate()`和`whereTime()`。

```php
$products = Product::whereDate('created_at', '2018-01-31')->get();
$products = Product::whereMonth('created_at', '12')->get();
$products = Product::whereDay('created_at', '31')->get();
$products = Product::whereYear('created_at', date('Y'))->get();
$products = Product::whereTime('created_at', '=', '14:13:58')->get();
```

## 增加和减少

如果你想要在某个表中递增某列，只需使用 `increment()` 函数。噢，你不仅可以递增1，还可以递增一些数字，比如50。

```php
Post::find($post_id)->increment('view_count');
User::find($user_id)->increment('points', 50);
```

## 不使用时间戳列

如果你的数据库表中不包含 `created_at` 和 `updated_at` 时间戳字段，你可以通过设置 `$timestamps = false` 属性来指定 Eloquent 模型不使用它们。

```php
class Company extends Model
{
    public $timestamps = false;
}
```

## 软删除：批量恢复

在使用软删除时，你可以一次恢复多行数据。

```php
Post::onlyTrashed()->where('author_id', 1)->restore();
```

## 模型全部：列

在调用 Eloquent 的 `Model::all()` 方法时，你可以指定要返回的列。

```php
$users = User::all(['id', 'name', 'email']);
```

## 成功或失败

除了 `findOrFail()` 方法之外，还有 Eloquent 的 `firstOrFail()` 方法，如果查询未找到记录，它将返回404页面。

```php
$user = User::where('email', 'povilas@laraveldaily.com')->firstOrFail();
```

## 更改列名

在Eloquent查询构建器中，你可以使用 "as" 来返回具有不同名称的任何列，就像在普通的SQL查询中一样。

```php
$users = DB::table('users')->select('name', 'email as user_email')->get();
```

## 映射查询结果

在Eloquent查询之后，你可以使用集合的 `map()` 函数来修改行数据。

```php
$users = User::where('role_id', 1)->get()->map(function (User $user) {
    $user->some_column = some_function($user);
    return $user;
});
```

## 更改默认的时间戳字段

如果你正在使用非 Laravel 数据库，而且你的时间戳列命名不同，比如你有一个 `create_time` 和 `update_time` 列，你也可以在模型中指定它们：

```php
class Role extends Model
{
    const CREATED_AT = 'create_time';
    const UPDATED_AT = 'update_time';
}
```

## 快速按创建时间排序

不需要:

```php
User::orderBy('created_at', 'desc')->get();
```

你可以更快地这样做：

```php
User::latest()->get();
```

默认情况下，`latest()` 会按照 `created_at` 进行排序。

还有一个相反的方法 `oldest()`，它会按照 `created_at` 升序排序：

```php
User::oldest()->get();
```

你也可以指定其他列进行排序。例如，如果你想使用 `updated_at` 进行排序，可以这样做：

```php
$lastUpdatedUser = User::latest('updated_at')->first();
```

## 创建记录时自动生成列值

如果你想在创建记录时生成一些数据库列的值，可以将其添加到模型的 `boot()` 方法中。
例如，如果你有一个字段 "position" ，并且想将下一个可用的位置分配给新记录（如 `Country::max('position') + 1）`，可以这样做：

```php
class Country extends Model {
    protected static function boot()
    {
        parent::boot();

        Country::creating(function($model) {
            $model->position = Country::max('position') + 1;
        });
    }
}
```

## 使用原始查询加速计算

使用 SQL 原始查询，如 `whereRaw()` 方法，在查询中直接进行一些特定于数据库的计算，而不是在 Laravel 中进行，通常结果会更快。例如，如果你想获取在注册后30天以上仍然活跃的用户，可以使用以下代码：

```php
User::where('active', 1)
    ->whereRaw('TIMESTAMPDIFF(DAY, created_at, updated_at) > ?', 30)
    ->get();
```

## 多个作用域

你可以在 Eloquent 中组合和链接查询作用域，使用多个作用域进行查询。

模型类:

```php
public function scopeActive($query) {
    return $query->where('active', 1);
}

public function scopeRegisteredWithinDays($query, $days) {
    return $query->where('created_at', '>=', now()->subDays($days));
}
```

控制器:

```php
$users = User::registeredWithinDays(30)->active()->get();
```

## 不需要转换 Carbon

如果你使用 `whereDate()` 并检查今天的记录，可以使用 Carbon 的 `now()`，它会自动转换为日期。不需要使用 `->toDateString()`。

```php
// Instead of
$todayUsers = User::whereDate('created_at', now()->toDateString())->get();
// No need to convert, just use now()
$todayUsers = User::whereDate('created_at', now())->get();
```

## 按首字母分组

你可以按照任意自定义条件对 Eloquent 结果进行分组，以下是按用户姓名的首字母分组的方法：

```php
$users = User::all()->groupBy(function($item) {
    return $item->name[0];
});
```

## 不更新某列

如果你有一个数据库列，希望只设置一次并且不再更新，你可以在Eloquent模型上使用一个修改器（mutator）来设置这个限制：

- 在9及以上版本中:

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn ($value, $attributes) => $attributes['email'] ?? $value,
        );
    }
}
```

- 在9及以下版本中:

```php
class User extends Model
{
    public function setEmailAttribute($value)
    {
        if (isset($this->attributes['email']) && ! is_null($this->attributes['email'])) {
            return;
        }
        $this->attributes['email'] = $value;
    }
}
```

## 查找多条记录

Eloquent的 `find()` 方法可以接受多个参数，并返回找到的所有记录的集合，而不仅仅是一个模型：

```php
// Will return Eloquent Model
$user = User::find(1);
// Will return Eloquent Collection
$users = User::find([1,2,3]);
```

```php
return Product::whereIn('id', $this->productIDs)->get();
// You can do this
return Product::find($this->productIDs)
```

Tip 来自 [@tahiriqbalnajam](https://twitter.com/tahiriqbalnajam/status/1436120403655671817)

对于整数，使用 `whereIn` 仅限于有限的数据范围，而不是使用 `whereIntegerInRaw`，后者比 `whereIn` 更快。

```php
Product::whereIn('id', range(1, 50))->get();
// You can do this
Product::whereIntegerInRaw('id', range(1, 50))->get();
```

Tip 来自 [@sachinkiranti](https://raisachin.com.np)

## 查找多条记录并返回指定列

Eloquent 的 `find()` 方法可以接受多个参数，并返回找到的所有记录的集合，只包含指定的列，而不是模型的所有列：

```php
// Will return Eloquent Model with first_name and email only
$user = User::find(1, ['first_name', 'email']);
// Will return Eloquent Collection with first_name and email only
$users = User::find([1,2,3], ['first_name', 'email']);
```

Tip 来自 [@tahiriqbalnajam](https://github.com/tahiriqbalnajam)

## 根据键查找

你还可以使用 `whereKey()` 方法查找多个记录，该方法会自动处理哪个字段是你的主键（默认为 `id`，但你可以在 Eloquent 模型中覆盖它）：

```php
$users = User::whereKey([1,2,3])->get();
```

## 使用UUID而不是自增ID

你不想在模型中使用自增ID吗？

迁移类:

```php
Schema::create('users', function (Blueprint $table) {
    // $table->increments('id');
    $table->uuid('id')->unique();
});
```

### Laravel 9 及以上:

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "8f8e8478-9035-4d23-b9a7-62f4d2612ce5"
```

### Laravel 8 及以下:

模型类:

- 在 PHP 7.4.0 及以上版本:

```php
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();

        self::creating(fn (User $model) => $model->attributes['id'] = Str::uuid());
        self::saving(fn (User $model) => $model->attributes['id'] = Str::uuid());
    }
}
```

- 在 7.4.0 版本之前的 PHP :

```php
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
             $model->attributes['id'] = Str::uuid();
        });
        self::saving(function ($model) {
             $model->attributes['id'] = Str::uuid();
        });
    }
}
```

## Laravel 中的子查询


从 Laravel 6 开始，你可以在 Eloquent 语句中使用 `addSelect()` 方法，并对添加的列进行一些计算。

```php
return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderBy('arrived_at', 'desc')
    ->limit(1)
])->get();
```

## 隐藏某些列

在进行 Eloquent 查询时，如果你想隐藏返回结果中的特定字段，其中一种最快的方法是在集合结果上添加 `->makeHidden()`。

```php
$users = User::all()->makeHidden(['email_verified_at', 'deleted_at']);
```

## 精确的数据库错误

如果你想捕获 Eloquent 查询异常，使用特定的 `QueryException` 而不是默认的 Exception 类，你将能够获取到错误的精确 SQL 代码。

```php
try {
    // Some Eloquent/SQL statement
} catch (\Illuminate\Database\QueryException $e) {
    if ($e->getCode() === '23000') { // integrity constraint violation
        return back()->withError('Invalid data');
    }
}
```

## 使用查询构建器进行软删除

不要忘记，当使用 Eloquent 时，软删除会排除已软删除的条目，但如果使用查询构建器，则不起作用。

```php
// Will exclude soft-deleted entries
$users = User::all();

// Will NOT exclude soft-deleted entries
$users = User::withTrashed()->get();

// Will NOT exclude soft-deleted entries
$users = DB::table('users')->get();
```

## 使用传统的 SQL 查询

如果你需要执行一个简单的 SQL 查询，而不获取任何结果，比如在数据库架构中进行更改，你可以直接使用 `DB::statement()`。

```php
DB::statement('DROP TABLE users');
DB::statement('ALTER TABLE projects AUTO_INCREMENT=123');
```

## 使用数据库事务

如果你有两个数据库操作，第二个操作可能会出错，那么你应该回滚第一个操作，对吗？

为此，我建议使用数据库事务，在 Laravel 中非常容易：

```php
DB::transaction(function () {
    DB::table('users')->update(['votes' => 1]);

    DB::table('posts')->delete();
});
```

## 更新或创建

如果你需要检查记录是否存在，然后更新它，否则创建一个新记录，你可以在一句话中完成 - 使用 Eloquent 的 `updateOrCreate()` 方法：

```php
// Instead of this
$flight = Flight::where('departure', 'Oakland')
    ->where('destination', 'San Diego')
    ->first();
if ($flight) {
    $flight->update(['price' => 99, 'discounted' => 1]);
} else {
    $flight = Flight::create([
        'departure' => 'Oakland',
        'destination' => 'San Diego',
        'price' => 99,
        'discounted' => 1
    ]);
}
// Do it in ONE sentence
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

## 保存时忘记缓存

Tip 来自 [@pratiksh404](https://github.com/pratiksh404)

如果你有一个缓存键，比如 `posts`，它返回一个集合，并且你希望在新的存储或更新时忘记该缓存键，你可以在模型上调用静态的 `saved` 函数：

```php
class Post extends Model
{
    // Forget cache key on storing or updating
    public static function boot()
    {
        parent::boot();
        static::saved(function () {
           Cache::forget('posts');
        });
    }
}
```

## 更改 created_at 和 updated_at 的格式

Tip 来自 [@syofyanzuhad](https://github.com/syofyanzuhad)

要更改 `created_at` 的格式，你可以在你的模型中添加一个方法，如下所示：

自 Laravel 9 开始:
```php
protected function createdAtFormatted(): Attribute
{
    return Attribute::make(
        get: fn ($value, $attributes) => $attributes['created_at']->format('H:i d, M Y'),
    );
}
```

Laravel 8 及以下版本:
```php
public function getCreatedAtFormattedAttribute()
{
   return $this->created_at->format('H:i d, M Y');
}
```

这样，在需要时你可以使用 `$entry->created_at_formatted` 来获取 `created_at` 属性的格式化值。它将返回类似于 `04:19 23, Aug 2020` 的格式。

同样，要更改 `updated_at` 属性的格式，你可以添加以下方法：

自 Laravel 9 开始:
```php
protected function updatedAtFormatted(): Attribute
{
    return Attribute::make(
        get: fn ($value, $attributes) => $attributes['updated_at']->format('H:i d, M Y'),
    );
}
```

Laravel 8 及以下版本：
```php
public function getUpdatedAtFormattedAttribute()
{
   return $this->updated_at->format('H:i d, M Y');
}
```

这样，在需要时你可以使用 `$entry->updated_at_formatted` 来获取 `updated_at` 属性的格式化值。它将返回类似于 `04:19 23, Aug 2020` 的格式。

## 将数组类型存储为 JSON

Tip 来自 [@pratiksh404](https://github.com/pratiksh404)

如果你有一个接受数组并将其存储为 JSON 的输入字段，你可以在模型中使用 `$casts` 属性。这里的 `images` 是一个 JSON 属性。

```php
protected $casts = [
    'images' => 'array',
];
```

这样，你可以将其存储为 JSON，但从数据库中检索时，可以将其作为一个数组使用。

## 制作模型的副本

如果你有两个非常相似的模型（比如送货地址和账单地址），你需要将一个模型复制到另一个模型，你可以使用 `replicate()` 方法，然后在复制后更改一些属性。

示例来自 [官方文档](https://laravel.com/docs/8.x/eloquent#replicating-models):

```php
$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

## 减少内存占用

有时我们需要将大量数据加载到内存中。例如：

```php
$orders = Order::all();
```

但是如果数据量非常大，这样做可能会很慢，因为 Laravel 会准备模型类的对象。
在这种情况下，Laravel 提供了一个方便的函数 `toBase()`：

```php
$orders = Order::toBase()->get();
//$orders will contain `Illuminate\Support\Collection` with objects `StdClass`.
```

通过调用这个方法，它将从数据库中获取数据，但不会准备模型类。
请记住，通常最好将字段数组传递给 get 方法，以防止从数据库中获取所有字段。

## 在没有 $fillable / $guarded 的情况下强制查询

如果你创建一个 Laravel 脚手架作为其他开发人员的 “起始点”，并且你无法控制他们以后会填充模型的 $fillable / $guarded，你可以使用 forceFill()：

```php
$team->update(['name' => $request->name])
```

如果 Team 模型的 `$fillable` 中没有包含 "name" 字段呢？或者根本没有 `$fillable / $guarded`？

```php
$team->forceFill(['name' => $request->name])
```

这将在那个查询中“忽略” `$fillable`，无论如何都会执行。

## 父子三级结构

如果你有一个三级的父子结构，比如电子商务网站的分类，你想显示第三级的产品数量，你可以使用 `with('yyy.yyy')`，然后作为条件添加 `withCount()`。

```php
class HomeController extend Controller
{
    public function index()
    {
        $categories = Category::query()
            ->whereNull('category_id')
            ->with(['subcategories.subcategories' => function($query) {
                $query->withCount('products');
            }])->get();
    }
}
```

```php
class Category extends Model
{
    public function subcategories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
```

```php
<ul>
    @foreach($categories as $category)
        <li>
            {{ $category->name }}
            @if ($category->subcategories)
                <ul>
                @foreach($category->subcategories as $subcategory)
                    <li>
                        {{ $subcategory->name }}
                        @if ($subcategory->subcategories)
                            <ul>
                                @foreach ($subcategory->subcategories as $subcategory)
                                    <li>{{ $subcategory->name }} ({{ $subcategory->product_count }})</li>
                                @endforeach
                            </ul>
                        @endif
                    </li>
                @endforeach
                </ul>
            @endif
        </li>
    @endforeach
</ul>
```

## 在失败时执行其他操作

当查找记录时，如果找不到记录，你可能希望执行一些操作。
除了 `->firstOrFail()` 只会抛出 404 错误之外，你可以在失败时执行任何操作，只需使用 `->firstOr(function() { ... })`：

```php
$model = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
})
```

## 检查记录是否存在或显示 404

不要使用 find() 然后检查记录是否存在。使用 findOrFail()。

```php
$product = Product::find($id);
if (!$product) {
    abort(404);
}
$product->update($productDataArray);
```

更简洁的方式

```php
$product = Product::findOrFail($id); // shows 404 if not found
$product->update($productDataArray);
```

## 如果条件失败则中止

`abort_if()` 可以用作检查条件并抛出错误页面的更简洁方式。

```php
$product = Product::findOrFail($id);
if($product->user_id != auth()->user()->id){
    abort(403);
}
```

更简洁的方式

```php
/* abort_if(CONDITION, ERROR_CODE) */
$product = Product::findOrFail($id);
abort_if ($product->user_id != auth()->user()->id, 403)
```

## 在将数据持久化到数据库时自动填充列

如果你想在将数据持久化到数据库时自动填充某一列（例如：slug），使用模型观察器而不是每次硬编码填充。

```php
use Illuminate\Support\Str;

class Article extends Model
{
    ...
    protected static function boot()
    {
        parent:boot();

        static::saving(function ($model) {
            $model->slug = Str::slug($model->title);
        });
    }
}
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1432390722280427521)

## 有关查询的额外信息

你可以在查询上调用 `explain()` 方法来获取关于查询的额外信息。

```php
Book::where('name', 'Ruskin Bond')->explain()->dd();
```

```php
Illuminate\Support\Collection {#5344
    all: [
        {#15407
            +"id": 1,
            +"select_type": "SIMPLE",
            +"table": "books",
            +"partitions": null,
            +"type": "ALL",
            +"possible_keys": null,
            +"key": null,
            +"key_len": null,
            +"ref": null,
            +"rows": 9,
            +"filtered": 11.11111164093,
            +"Extra": "Using where",
        },
    ],
}
```

Tip 来自 [@amit_merchant](https://twitter.com/amit_merchant/status/1432277631320223744)

## 在 Laravel 中使用 doesntExist() 方法

```php
// This works
if ( 0 === $model->where('status', 'pending')->count() ) {
}

// But since I don't care about the count, just that there isn't one
// Laravel's exists() method is cleaner.
if ( ! $model->where('status', 'pending')->exists() ) {
}

// But I find the ! in the statement above easily missed. The
// doesntExist() method makes this statement even clearer.
if ( $model->where('status', 'pending')->doesntExist() ) {
}
```

Tip 来自 [@ShawnHooper](https://twitter.com/ShawnHooper/status/1435686220542234626)

## 你想要将一个 Trait 添加到几个模型中，以便自动调用它们的 boot() 方法。

如果你想将一个 Trait 添加到几个 Model 中以自动调用它们的 `boot()` 方法，你可以使用 boot[TraitName] 的方式调用 Trait 的方法。

```php
class Transaction extends Model
{
    use MultiTenantModelTrait;
}
```

```php
class Task extends Model
{
    use MultiTenantModelTrait;
}
```

```php
trait MultiTenantModelTrait
{
    // This method's name is boot[TraitName]
    // It will be auto-called as boot() of Transaction/Task
    public static function bootMultiTenantModelTrait()
    {
        static::creating(function ($model) {
            if (!$isAdmin) {
                $isAdmin->created_by_id = auth()->id();
            }
        })
    }
}
```

## 在 Laravel 中判断表是否为空有两种常见方法

在 Laravel 中判断表是否为空有两种常见方法。直接在模型上调用 `exists()` 或 `count()` 方法！

其中一个返回一个严格的 true/false 布尔值，另一个返回一个整数，你可以在条件语句中将其作为假值使用。

```php
public function index()
{
    if (\App\Models\User::exists()) {
        // returns boolean true or false if the table has any saved rows
    }

    if (\App\Models\User::count()) {
        // returns the count of rows in the table
    }
}
```

Tip 来自 [@aschmelyun](https://twitter.com/aschmelyun/status/1440641525998764041)

## 如何避免 “property of non-object” 错误

```php
// BelongsTo Default Models
// Let's say you have Post belonging to Author and then Blade code:
$post->author->name;

// Of course, you can prevent it like this:
$post->author->name ?? ''
// or
@$post->author->name

// But you can do it on Eloquent relationship level:
// this relation will return an empty App\Author model if no author is attached to the post
public function author() {
    return $this->belongsTo(Author::class)->withDefault();
}
// or
public function author() {
    return $this->belongsTo(Author::class)->withDefault([
        'name' => 'Guest Author'
    ]);
}
```

Tip 来自 [@coderahuljat](https://twitter.com/coderahuljat/status/1440556610837876741)

## 在修改 Eloquent 记录后获取原始属性

在修改 Eloquent 记录后，你可以通过调用 getOriginal() 方法来获取原始属性。

```php
$user = App\User::first();
$user->name; // John
$user->name = "Peter"; // Peter
$user->getOriginal('name'); // John
$user->getOriginal(); // Original $user record
```

Tip 来自 [@devThaer](https://twitter.com/devThaer/status/1442133797223403521)

## 一种简单的数据库播种方法

在 Laravel 中使用 .sql 转储文件进行数据库播种的简单方法

```php
DB::unprepared(
    file_get_contents(__DIR__ . './dump.sql')
);
```

Tip 来自 [@w3Nicolas](https://twitter.com/w3Nicolas/status/1447902369388249091)

## 查询构造器的 crossJoinSub 方法

使用 CROSS JOIN 子查询。

```php
use Illuminate\Support\Facades\DB;

$totalQuery = DB::table('orders')->selectRaw('SUM(price) as total');

DB::table('orders')
    ->select('*')
    ->crossJoinSub($totalQuery, 'overall')
    ->selectRaw('(price / overall.total) * 100 AS percent_of_total')
    ->get();
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## Belongs to Many 关联表命名

为了确定关联关系的中间表的表名，Eloquent 会按照字母顺序连接两个相关模型的名称。

这意味着 `Post` 和 `Tag` 之间的连接可以像这样添加：

```php
class Post extends Model
{
    public $table = 'posts';

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}
```

然而，你可以自由地覆盖这个约定，需要在第二个参数中指定连接表。

```php
class Post extends Model
{
    public $table = 'posts';

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'posts_tags');
    }
}
```

如果你希望明确指定主键，你也可以作为第三个和第四个参数提供它们。

```php
class Post extends Model
{
    public $table = 'posts';

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id');
    }
}
```

Tip 来自 [@iammikek](https://twitter.com/iammikek)

## 根据关联表字段排序

`BelongsToMany::orderByPivot()` 允许你直接对 BelongsToMany 关联关系查询的结果进行排序。

```php
class Tag extends Model
{
    public $table = 'tags';
}

class Post extends Model
{
    public $table = 'posts';

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id')
            ->using(PostTagPivot::class)
            ->withTimestamps()
            ->withPivot('flag');
    }
}

class PostTagPivot extends Pivot
{
    protected $table = 'post_tag';
}

// Somewhere in the Controller
public function getPostTags($id)
{
    return Post::findOrFail($id)->tags()->orderByPivot('flag', 'desc')->get();
}
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## 从数据库中查找单条记录

`sole()` 方法将只返回符合条件的一条记录。如果找不到这样的记录，将抛出 `NoRecordsFoundException` 异常。如果找到多条记录，则抛出 `MultipleRecordsFoundException` 异常。

```php
DB::table('products')->where('ref', '#123')->sole();
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## 自动记录分块

类似于 `each()` 方法，但更易于使用。自动将结果分成多个部分（块）。

```php
return User::orderBy('name')->chunkMap(fn ($user) => [
    'id' => $user->id,
    'name' => $user->name,
]), 25);
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## 在不触发事件的情况下更新模型

有时候需要更新模型但不发送任何事件。现在我们可以使用 `updateQuietly()` 方法来实现，它在内部使用 `saveQuietly()` 方法。

```php
$flight->updateQuietly(['departed' => false]);
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## 定期清理过时记录的模型

为了定期清理模型中的过时记录，可以使用这个 trait，在 Laravel 中会自动执行，只需要调整 Kernel 类中 `model:prune` 命令的频率即可。

```php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
class Flight extends Model
{
    use Prunable;
    /**
     * Get the prunable model query.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subMonth());
    }
}
```

此外，在清理方法中，你可以设置在删除模型之前要执行的操作：

```php
protected function pruning()
{
    // Removing additional resources,
    // associated with the model. For example, files.

    Storage::disk('s3')->delete($this->filename);
}
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## 不可变日期和类型转换

Laravel 8.53 引入了 `immutable_date` 和 `immutable_datetime` 类型转换，将日期转换为 `Immutable` 类型。

将日期转换为 Carbon 的不可变实例，而不是普通的 Carbon 实例。

```php
class User extends Model
{
    public $casts = [
        'date_field'     => 'immutable_date',
        'datetime_field' => 'immutable_datetime',
    ];
}
```

Tip 来自 [@PascalBaljet](https://twitter.com/pascalbaljet)

## findOrFail 方法也接受 id 列表

findOrFail 方法也接受 id 列表。如果其中任何一个 id 未找到，则会 "失败"。

适用于需要检索特定一组模型，并且不希望检查获得的数量是否与预期的数量相符的情况。

```php
User::create(['id' => 1]);
User::create(['id' => 2]);
User::create(['id' => 3]);

// Retrieves the user...
$user = User::findOrFail(1);

// Throws a 404 because the user doesn't exist...
User::findOrFail(99);

// Retrieves all 3 users...
$users = User::findOrFail([1, 2, 3]);

// Throws because it is unable to find *all* of the users
User::findOrFail([1, 2, 3, 99]);
```

Tip 来自 [@timacdonald87](https://twitter.com/timacdonald87/status/1457499557684604930)

## Prunable trait 自动从数据库中移除模型

Laravel 8.50 中新增了 Prunable trait，可以自动从数据库中移除模型。例如，可以在几天后永久删除软删除的模型。

```php
class File extends Model
{
    use SoftDeletes;

    // Add Prunable trait
    use Prunable;

    public function prunable()
    {
        // Files matching this query will be pruned
        return static::query()->where('deleted_at', '<=', now()->subDays(14));
    }

    protected function pruning()
    {
        // Remove the file from s3 before deleting the model
        Storage::disk('s3')->delete($this->filename);
    }
}

// Add PruneCommand to your schedule (app/Console/Kernel.php)
$schedule->command(PruneCommand::class)->daily();
```

Tip by [@Philo01](https://twitter.com/Philo01/status/1457626443782008834)

## withAggregate 方法

在 Eloquent 中，withAvg/withCount/withSum 等方法实际上使用了 'withAggregate' 方法。可以使用此方法基于关联关系添加子查询。

```php
// Eloquent Model
class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// Instead of eager loading all users...
$posts = Post::with('user')->get();

// You can add a subselect to only retrieve the user's name...
$posts = Post::withAggregate('user', 'name')->get();

// This will add a 'user_name' attribute to the Post instance:
$posts->first()->user_name;
```

Tip 来自 [@pascalbaljet](https://twitter.com/pascalbaljet/status/1457702666352594947)

## 日期约定

在 Laravel 模型中，使用 `something_at` 的约定而不仅仅是布尔值，可以让你知道标志何时被更改，比如产品何时上线。

```php
// Migration
Schema::table('products', function (Blueprint $table) {
    $table->datetime('live_at')->nullable();
});

// In your model
public function live()
{
    return !is_null($this->live_at);
}

// Also in your model
protected $dates = [
    'live_at'
];
```

Tip 来自 [@alexjgarrett](https://twitter.com/alexjgarrett/status/1459174062132019212)

## Eloquent多重插入或更新

upsert() 方法可以插入或更新多条记录。

- 第一个数组：要插入或更新的值
- 第二个数组：用于选择语句的唯一标识列
- 第三个数组：如果记录存在，则要更新的列

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150],
], ['departure', 'destination'], ['price']);
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1461591319516647426)

## 在过滤结果后检索查询构建器

要在过滤结果后检索查询构建器：可以使用 `->toQuery()` 方法。

该方法在集合模型的第一个模型和 Collection 模型上使用 `whereKey` 比较。

```php
// Retrieve all logged_in users
$loggedInUsers = User::where('logged_in', true)->get();

// Filter them using a Collection method or php filtering
$nthUsers = $loggedInUsers->nth(3);

// You can't do this on the collection
$nthUsers->update(/* ... */);

// But you can retrieve the Builder using ->toQuery()
if ($nthUsers->isNotEmpty()) {
    $nthUsers->toQuery()->update(/* ... */);
}
```

Tip 来自 [@RBilloir](https://twitter.com/RBilloir/status/1462529494917566465)

## 自定义类型转换

你可以创建自定义类型转换，让 Laravel 自动格式化你的 Eloquent 模型数据。以下是一个在检索或更改用户名称时将其大写的示例。

```php
class CapitalizeWordsCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return ucwords($value);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return ucwords($value);
    }
}

class User extends Model
{
    protected $casts = [
        'name'  => CapitalizeWordsCast::class,
        'email' => 'string',
    ];
}
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1462828232206659586)

## 基于关联模型的平均值或计数排序

你是否需要根据关联模型的平均值或计数进行排序？

使用 Eloquent 很容易实现！

```php
public function bestBooks()
{
    Book::query()
        ->withAvg('ratings as average_rating', 'rating')
        ->orderByDesc('average_rating');
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1466769691385335815)

## 返回事务结果

如果你有一个数据库事务，并且想要返回其结果，至少有两种方法，参见下面的示例

```php
// 1. You can pass the parameter by reference
$invoice = NULL;
DB::transaction(function () use (&$invoice) {
    $invoice = Invoice::create(...);
    $invoice->items()->attach(...);
})

// 2. Or shorter: just return trasaction result
$invoice = DB::transaction(function () {
    $invoice = Invoice::create(...);
    $invoice->items()->attach(...);

    return $invoice;
});
```

## 从查询中移除多个全局作用域

在使用 Eloquent 全局作用域时，不仅可以使用多个作用域，还可以通过向 `withoutGlobalScopes()` 方法提供数组来移除特定的作用域。

[文档链接](https://laravel.com/docs/8.x/eloquent#removing-global-scopes)

```php
// Remove all of the global scopes...
User::withoutGlobalScopes()->get();

// Remove some of the global scopes...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();
```

## 根据 JSON 列属性排序

使用 Eloquent，你可以根据 JSON 列属性对结果进行排序

```php
// JSON column example:
// bikes.settings = {"is_retired": false}
$bikes = Bike::where('athlete_id', $this->athleteId)
        ->orderBy('name')
        ->orderByDesc('settings->is_retired')
        ->get();
```

Tip 来自 [@brbcoding](https://twitter.com/brbcoding/status/1473353537983856643)

## 从第一个结果中获取单列的值

你可以使用 `value()` 方法从查询的第一个结果中获取单列的值

```php
// Instead of
Integration::where('name', 'foo')->first()->active;

// You can use
Integration::where('name', 'foo')->value('active');

// or this to throw an exception if no records found
Integration::where('name', 'foo')->valueOrFail('active')';
```

Tip 来自 [@justsanjit](https://twitter.com/justsanjit/status/1475572530215796744)

## 检查修改的值是否改变了键

想知道你对模型所做的更改是否改变了键的值？没问题，只需使用 originalIsEquivalent 方法。

```php
$user = User::first(); // ['name' => "John']

$user->name = 'John';

$user->originalIsEquivalent('name'); // true

$user->name = 'David'; // Set directly
$user->fill(['name' => 'David']); // Or set via fill

$user->originalIsEquivalent('name'); // false
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1475843987181379599)

## 定义访问器和修改器的新方法

在 Laravel 8.77 中，定义属性访问器和修改器的新方法：

```php
// Before, two-method approach
public function setTitleAttribute($value)
{
    $this->attributes['title'] = strtolower($value);
}
public function getTitleAttribute($value)
{
    return strtoupper($value);
}

// New approach
protected function title(): Attribute
{
    return new Attribute(
        get: fn ($value) => strtoupper($value),
        set: fn ($value) => strtolower($value),
    );
}
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1473697808456851466)

## 另一种访问器和修改器的方法

如果你将在许多模型中使用相同的访问器和修改器，你可以使用自定义转换。

只需创建一个实现 `CastsAttributes` 接口的类。该类应该有两个方法，第一个是 `get` ，用于指定如何从数据库中检索模型，第二个是 `set` ，用于指定如何将值存储在数据库中。 

```php
<?php

namespace App\Casts;

use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class TimestampsCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return Carbon::parse($value)->diffForHumans();
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return Carbon::parse($value)->format('Y-m-d h:i:s');
    }
}

```

然后你可以在模型类中实现强制转换。

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Casts\TimestampsCast;
use Carbon\Carbon;


class User extends Authenticatable
{

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'updated_at' => TimestampsCast::class,
        'created_at' => TimestampsCast::class,
    ];
}

```

Tip 来自 [@AhmedRezk](https://github.com/AhmedRezk59)

## 当搜索第一条记录时，你可以执行一些操作

当搜索第一条记录时，如果找不到，你可以执行一些操作。`firstOrFail()` 会抛出一个 404 异常。

你可以使用 `firstOr(function() {})` 来替代。Laravel 已经为你做好了准备。

```php
$book = Book::whereCount('authors')
            ->orderBy('authors_count', 'DESC')
            ->having('modules_count', '>', 10)
            ->firstOr(function() {
                // The Sky is the Limit ...

                // You can perform any action here
            });
```

Tip 来自 [@bhaidar](https://twitter.com/bhaidar/status/1487757487566639113/)

## 直接将 created_at 日期转换为人类可读格式

你知道吗？你可以直接将 created_at 日期转换为人类可读的格式，比如"1分钟前"、"1个月前"，使用 diffForHumans() 函数。Laravel Eloquent 默认在  created_at 字段上启用了 Carbon 实例。

```php
$post = Post::whereId($id)->first();
$result = $post->created_at->diffForHumans();

/* OUTPUT */
// 1 Minutes ago, 2 Week ago etc..as per created time
```

Tip 来自 [@vishal\_\_2931](https://twitter.com/vishal__2931/status/1488369014980038662)

## 按 Eloquent 访问器排序


可以按 Eloquent 访问器进行排序！是的，这是可行的。我们不是在数据库级别上按访问器排序，而是在返回的集合上按访问器排序。

```php
class User extends Model
{
    // ...
    protected $appends = ['full_name'];

    // Since Laravel 9
    protected function full_name(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['first_name'] . ' ' . $attributes['last_name'];),
        );
    }

    // Laravel 8 and lower
    public function getFullNameAttribute()
    {
        return $this->attribute['first_name'] . ' ' . $this->attributes['last_name'];
    }
    // ..
}
```

```php
class UserController extends Controller
{
    // ..
    public function index()
    {
        $users = User::all();

        // order by full_name desc
        $users->sortByDesc('full_name');

        // or

        // order by full_name asc
        $users->sortBy('full_name');

        // ..
    }
    // ..
}
```

`sortByDesc` 和 `sortBy` 是集合上的方法。

Tip 来自 [@bhaidar](https://twitter.com/bhaidar/status/1490671693618053123)

## 检查特定模型是否已创建或找到

如果你想检查特定模型是否已创建或找到，请使用 `wasRecentlyCreated` 模型属性。

```php
$user = User::create([
    'name' => 'Oussama',
]);

// return boolean
return $user->wasRecentlyCreated;

// true for recently created
// false for found (already on you db)
```

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1491141790015320064)

## 使用数据库驱动的 Laravel Scout

在 Laravel v9 中，你可以使用具有数据库驱动的 Laravel Scout（搜索）。不再需要使用 where 语句！

```php
$companies = Company::search(request()->get('search'))->paginate(15);
```

Tip 来自 [@magarrent](https://twitter.com/magarrent/status/1493221422675767302)

## 在查询构建器上使用 value 方法

在查询构建器上使用 `value` 方法可以执行更高效的查询，当你只需要检索单个列时。

```php
// Before (fetches all columns on the row)
Statistic::where('user_id', 4)->first()->post_count;

// After (fetches only `post_count`)
Statistic::where('user_id', 4)->value('post_count');
```

Tip 来自 [@mattkingshott](https://twitter.com/mattkingshott/status/1493583444244410375)

## 将数组传递给 where 方法

在 Laravel 中，你可以将数组传递给 `where` 方法。

```php
// Instead of this
JobPost::where('company', 'laravel')
        ->where('job_type', 'full time')
        ->get();

// You can pass an array
JobPost::where(['company' => 'laravel',
                'job_type' => 'full time'])
        ->get();
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1495626752282234881)

## 从模型集合中返回主键

你知道 `modelsKeys()` 是 Eloquent 集合方法吗？它返回模型集合的主键。

```php
$users = User::active()->limit(3)->get();

$users->modelsKeys(); // [1, 2, 3]
```

Tip 来自 [@iamharis010](https://twitter.com/iamharis010/status/1495816807910891520)

## 强制Laravel使用贪婪加载

如果你想要在应用程序中阻止延迟加载，你只需要在 `AppServiceProvider` 的 `boot()` 方法中添加以下代码行。

```php
Model::preventLazyLoading();
```

但是，如果你只想在本地开发环境中启用此功能，你可以在代码中进行更改：

```php
Model::preventLazyLoading(!app()->isProduction());
```

Tip 来自 [@CatS0up](https://github.com/CatS0up)

## 使所有模型可批量赋值

出于安全原因，这不是一种推荐的方法，但是可以实现。

当你想要这样做时，你不需要为每个模型设置一个空的 `$guarded` 数组，像这样：

```php
protected $guarded = [];
```

你可以从一个地方做到这一点，只需在 `AppServiceProvider` 的 `boot()` 方法中添加以下行：

```php
Model::unguard();
```

现在，你的所有模型都可以进行批量赋值。

Tip 来自 [@CatS0up](https://github.com/CatS0up)

## 隐藏选择所有语句中的列

如果你使用的是 Laravel v8.78 及更高版本，以及 MySQL 8.0.23 及更高版本，你可以将选择的列定义为"不可见"。被定义为 `invisible` 的列将在 `select *` 语句中隐藏。

但是，要做到这一点，我们必须在迁移中使用 `invisible()` 方法，类似于以下示例：

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('table', function (Blueprint $table) {
    $table->string('secret')->nullable()->invisible();
});
```

就是这样！这将使选择的列在 `select *` 语句中隐藏起来。

Tip 来自 [@CatS0up](https://github.com/CatS0up)

## JSON Where子句

Laravel 提供了用于查询支持 JSON 列的数据库的辅助方法。

目前，支持这些方法的数据库有：MySQL 5.7+、PostgreSQL、SQL Server 2016 和 SQLite 3.9.0（使用JSON1扩展）。

```php
// To query a json column you can use the -> operator
$users = User::query()
            ->where('preferences->dining->meal', 'salad')
            ->get();
// You can check if a JSON array contains a set of values
$users = User::query()
            ->whereJsonContains('options->languages', [
                'en', 'de'
               ])
            ->get();
// You can also query by the length a JSON array
$users = User::query()
            ->whereJsonLength('options->languages', '>', 1)
            ->get();
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1509663119311663124)

## 获取表的所有列名

```php
DB::getSchemaBuilder()->getColumnListing('users');
/*
returns [
    'id',
    'name',
    'email',
    'email_verified_at',
    'password',
    'remember_token',
    'created_at',
    'updated_at',
];
*/
```

Tip 来自 [@aaronlumsden](https://twitter.com/aaronlumsden/status/1511014229737881605)

## 比较两列的值：

可以使用 `whereColumn` 方法来比较两列的值。

```php
return Task::whereColumn('created_at', 'updated_at')->get();
// pass a comparison operator
return Task::whereColumn('created_at', '>', 'updated_at')->get();
```

Tip 来自 [@iamgurmandeep](https://twitter.com/iamgurmandeep/status/1511673260353548294)

## 访问器缓存

从 Laravel 9.6 开始，如果你有一个计算密集型的访问器，你可以使用 shouldCache 方法。

```php
public function hash(): Attribute
{
    return Attribute::make(
        get: fn($value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1514304409563402244)

## 新的 scalar() 方法

在 Laravel 9.8.0 中，添加了 `scalar()` 方法，允许你从查询结果中获取第一行的第一列。

```php
// Before
DB::selectOne("SELECT COUNT(CASE WHEN food = 'burger' THEN 1 END) AS burgers FROM menu_items;")->burgers
// Now
DB::scalar("SELECT COUNT(CASE WHEN food = 'burger' THEN 1 END) FROM menu_items;")
```

Tip 来自 [@justsanjit](https://twitter.com/justsanjit/status/1514550185837408265)

## 选择特定列

要在模型中选择特定列，可以使用 select 方法，或者直接将数组传递给 get 方法！

```php
// Select specified columns from all employees
$employees = Employee::select(['name', 'title', 'email'])->get();
// Select specified columns from all employees
$employees = Employee::get(['name', 'title', 'email']);
```

Tip 来自 [@ecrmnn](https://twitter.com/ecrmnn/status/1516087672351203332)

## 在查询中链式使用条件子句而无需编写 if-else 语句：

查询构建器中的 "when" 助手非常 🔥。

你可以在查询中链式使用条件子句，而无需编写 if-else 语句。

这样可以使你的查询非常清晰：

```php
class RatingSorter extends Sorter
{
    function execute(Builder $query)
    {
        $query
            ->selectRaw('AVG(product_ratings.rating) AS avg_rating')
            ->join('product_ratings', 'products.id', '=', 'product_ratings.product_id')
            ->groupBy('products.id')
            ->when(
                $this->direction === SortDirections::Desc,
                fn () => $query->orderByDesc('avg_rating')
                fn () => $query->orderBy('avg_rating'),
            );

        return $query;
    }
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1521461317940350976)

## 在模型中覆盖连接属性

在 Laravel 中为单个模型覆盖数据库连接属性是一种强大的技术。以下是一些特别方便的使用情况：

### 1. 多个数据库连接

如果你的应用程序使用多个数据库连接（例如MySQL、PostgreSQL或同一数据库的不同实例），你可能希望指定某个模型应使用哪个连接。通过覆盖 `$connection` 属性，你可以轻松管理这些连接，并确保模型与适当的数据库进行交互。

### 2. 数据分片

在使用数据分片将数据分布在多个数据库的情况下，你可能有不同的模型映射到不同的分片。在每个模型中覆盖连接属性，可以定义使用哪个分片，而不影响其他模型或默认连接。

### 3. 第三方集成

当与提供自己数据库的第三方服务集成时，你可能需要为表示来自该服务数据的模型使用特定的连接。通过在该模型中覆盖连接属性，可以确保它连接到正确的数据库，同时保持应用程序的默认设置不变。

### 4. 多租户应用


在多租户应用中，你可能为每个租户拥有单独的数据库。通过在模型中动态覆盖 `$connection` 属性，可以根据当前用户轻松切换租户数据库，确保数据隔离和正确的资源管理。

要在模型中覆盖连接属性，请在类中定义 `$connection` 属性：

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomModel extends Model
{
    protected $connection = 'your_custom_connection';
}
```

## 在 Where 子句中使用列名（动态 Where 子句）

您可以在 where 子句中使用列名来创建动态 where 子句。 在下面的示例中，我们使用 `whereName('John')` 而不是 `where('name', 'John')`。

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    public function example()
    {
        return User::whereName('John')->get();
    }
}
```

Tip 来自 [@MNurullahSaglam](https://twitter.com/MNurullahSaglam/status/1699763337586749585)

## 使用 firstOrCreate()

您可以使用 firstOrCreate() 查找与属性匹配的第一条记录，如果不存在则创建它。

### 示例场景

假设您正在导入 CSV 文件，并且您想要创建一个类别（如果该类别不存在）。

```php
<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function example(Request $request)
    {
        // instead of
        $category = Category::where('name', $request->name)->first();
        
        if (!$category) {
            $category = Category::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
            ]);
        }
        
        // you can use
        $category = Category::firstOrCreate([
            'name' => $request->name,
        ], [
            'slug' => Str::slug($request->name),
        ]);

        return $category;
    }
}
```

Tip 来自 [@MNurullahSaglam](https://twitter.com/MNurullahSaglam/status/1699773783748366478)