# 集合

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (表单验证)](validation.md) ➡️ [下一条 (用户授权)](auth.md)


## 使用自定义回调函数对集合进行 groupBy 操作

如果你想根据数据库中不存在的某些条件对结果进行分组，可以通过提供闭包函数来实现。

例如，如果你想按注册日期将用户分组，可以使用以下代码：

```php
$users = User::all()->groupBy(function($item) {
    return $item->created_at->format('Y-m-d');
});
```

⚠️ 注意：这是在 `Collection` 类上执行的操作， 所以是在从数据库获取（**AFTER**）结果之后进行的。

## 可以使用 "Higher Order" 的 orWhere 方法组合 Laravel 作用域

以下是文档中的示例。

Before:
```php
User::popular()->orWhere(function (Builder $query) {
     $query->active();
})->get()
```

After:
```php
User::popular()->orWhere->active()->get();
```

Tip 来自 [@TheLaravelDev](https://twitter.com/TheLaravelDev/status/1564608208102199298/)

## 连续使用多个集合方法

如果你使用 `->all()` 或 `->get()` 查询所有结果，然后可以对相同的结果执行各种集合操作，这样不会每次都查询数据库。

```php
$users = User::all();
echo 'Max ID: ' . $users->max('id');
echo 'Average age: ' . $users->avg('age');
echo 'Total budget: ' . $users->sum('budget');
```

## 在分页中计算总和

当你只有分页的集合时，如何计算所有记录的总和？在分页之前进行计算，但使用相同的查询。

```php
// How to get sum of post_views with pagination?
$posts = Post::paginate(10);
// This will be only for page 1, not ALL posts
$sum = $posts->sum('post_views');

// Do this with Query Builder
$query = Post::query();
// Calculate sum
$sum = $query->sum('post_views');
// And then do the pagination from the same query
$posts = $query->paginate(10);
```

## 在 foreach 循环中使用序号和分页

我们可以使用 foreach 循环中的集合项索引作为序号（SL）在分页中使用。

```php
   ...
   <th>Serial</th>
    ...
    @foreach ($products as $product)
    <tr>
        <td>{{ $loop->index + $product->firstItem() }}</td>
        ...
    @endforeach
```

这将解决下一页（?page=2&...）继续计数的问题。

## 高阶集合消息

集合还支持 "高阶消息"，它们是对集合执行常见操作的快捷方式。
此示例计算优惠中每组产品的价格。

```php
$offer = [
        'name'  => 'offer1',
        'lines' => [
            ['group' => 1, 'price' => 10],
            ['group' => 1, 'price' => 20],
            ['group' => 2, 'price' => 30],
            ['group' => 2, 'price' => 40],
            ['group' => 3, 'price' => 50],
            ['group' => 3, 'price' => 60]
        ]
];

$totalPerGroup = collect($offer['lines'])->groupBy->group->map->sum('price');
```

## 获取现有的键或在键不存在时插入值并返回该值

在 Laravel 8.81 中，为集合添加了 `getOrPut` 方法，简化了以下用例：如果要获取现有的键，或者在键不存在时插入值并返回该值。

```php
$key = 'name';
// Still valid
if ($this->collection->has($key) === false) {
    $this->collection->put($key, ...);
}

return $this->collection->get($key);

// Using the `getOrPut()` method with closure
return $this->collection->getOrPut($key, fn() => ...);

// Or pass a fixed value
return $this->collection->getOrPut($key, $value='teacoders');
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1488338815592718336)

## 静态 times 方法

静态 times 方法通过指定的次数调用给定的闭包函数来创建一个新的集合。

```php
Collection::times(7, function ($number) {
    return now()->addDays($number)->format('d-m-Y');
});
// Output: [01-04-2022, 02-04-2022, ..., 07-04-2022]
```

Tip 来自 [@Teacoders](https://twitter.com/Teacoders/status/1509447909602906116)

