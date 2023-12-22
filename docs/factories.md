# 工厂

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (Artisan)](artisan.md) ➡️ [下一条 (日志和调试)](log-and-debug.md)

## 工厂回调函数

在使用工厂生成种子数据时，你可以提供工厂回调函数来在记录插入后执行某些操作。

```php
$factory->afterCreating(App\User::class, function ($user, $faker) {
    $user->accounts()->save(factory(App\Account::class)->make());
});
```

## 使用 Seeds / Factories 生成图像

你知道吗，Faker 不仅可以生成文本值，还可以生成图像？在这里看到 `avatar` 字段 - 它将生成一个 50x50 的图像：

```php
$factory->define(User::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => bcrypt('password'),
        'remember_token' => Str::random(10),
        'avatar' => $faker->image(storage_path('images'), 50, 50)
    ];
});
```

## 覆盖值并应用自定义逻辑

在使用工厂创建记录时，你可以使用 Sequence 类来覆盖某些值并应用自定义逻辑。

```php
$users = User::factory()
                ->count(10)
                ->state(new Sequence(
                    ['admin' => 'Y'],
                    ['admin' => 'N'],
                ))
                ->create();
```

## 使用关联的工厂

在使用关联的工厂时，Laravel 还提供了魔术方法。

```php
// magic factory relationship methods
User::factory()->hasPosts(3)->create();

// instead of
User::factory()->has(Post::factory()->count(3))->create();
```

Tip 来自 [@oliverds\_](https://twitter.com/oliverds_/status/1441447356323430402)

## 创建模型时不触发任何事件

有时你可能希望在不触发任何事件的情况下 `update` 给定的模型。你可以使用 `updateQuietly` 方法来实现这一点。

```php
Post::factory()->createOneQuietly();

Post::factory()->count(3)->createQuietly();

Post::factory()->createManyQuietly([
    ['message' => 'A new comment'],
    ['message' => 'Another new comment'],
]);
```

## 有用的 for() 方法

Laravel 工厂有一个非常有用的 `for()` 方法。你可以使用它来创建 `belongsTo()` 关联。

```php
public function run()
{
    Product::factory()
        ->count(3)
        ->for(Category::factory()->create())
        ->create();
}
```

Tip 来自 [@mmartin_joo](https://twitter.com/mmartin_joo/status/1461002439629361158)

## 在不触发事件的情况下运行工厂

如果你想使用工厂创建多个记录而不触发任何事件，可以将代码包装在 withoutEvents 闭包中。

```php
$posts = Post::withoutEvents(function () {
    return Post::factory()->count(50)->create();
});
```

Tip 来自 [@TheLaravelDev](https://twitter.com/TheLaravelDev/status/1510965402666676227)

## 在 run() 方法中指定依赖关系

你可以在 seeder 的 `run()` 方法中指定依赖关系。
You can specify dependencies in the `run()` method of your seeder.

```php
class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $user = User::factory()->create();

        $this->callWith(EventSeeder::class, [
            'user' => $user
        ]);
    }
}
```

```php
class EventSeeder extends Seeder
{
    public function run(User $user)
    {
        Event::factory()
            ->when($user, fn($f) => $f->for('user'))
            ->for(Program::factory())
            ->create();
    }
}
```

Tip 来自 [@justsanjit](https://twitter.com/justsanjit/status/1514428294418079746)

