# 数据库迁移

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (模型关联)](models-relations.md) ➡️ [下一条 (视图)](views.md)

## 迁移顺序

如果你想更改数据库迁移的顺序，只需将文件的时间戳重命名，例如将 `2018_08_04_070443_create_posts_table.php` 改为 `2018_07_04_070443_create_posts_table.php` (将 `2018_08_04` 改为 `2018_07_04`)。

它们按字母顺序运行。

## 迁移字段带时区

你知道在迁移中不仅有 `timestamps()`，还有带时区的 `timestampsTz()` 吗？
```php
Schema::create('employees', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name');
    $table->string('email');
    $table->timestampsTz();
});
```

此外，还有 `dateTimeTz()`, `timeTz()`, `timestampTz()`, `softDeletesTz()` 等列类型。

## 数据库迁移列类型

迁移中有一些有趣的列类型，以下是一些示例。

```php
$table->geometry('positions');
$table->ipAddress('visitor');
$table->macAddress('device');
$table->point('position');
$table->uuid('id');
```

在 [官方文档](https://laravel.com/docs/master/migrations#creating-columns) 中可以查看所有列类型。

## 默认时间戳

在创建迁移时，你可以使用 `timestamp()` 列类型和 `useCurrent()` 选项以及 `useCurrentOnUpdate()` 选项，它将将 `CURRENT_TIMESTAMP` 设置为默认值。

```php
$table->timestamp('created_at')->useCurrent();
$table->timestamp('updated_at')->useCurrentOnUpdate();
```

## 迁移状态

如果你想要检查已执行或尚未执行的迁移，无需查看数据库中的 "migrations" 表，你可以运行 `php artisan migrate:status` 命令。

示例结果:

```
Migration name .......................................................................... Batch / Status  
2014_10_12_000000_create_users_table ........................................................... [1] Ran  
2014_10_12_100000_create_password_resets_table ................................................. [1] Ran  
2019_08_19_000000_create_failed_jobs_table ..................................................... [1] Ran    
```

## 使用空格创建迁移

在输入 `make:migration` 命令时，你不一定需要在各部分之间使用下划线 `_` 符号，比如 `create_transactions_table`。你可以将名称放在引号中，然后使用空格代替下划线。

```php
// This works
php artisan make:migration create_transactions_table

// But this works too
php artisan make:migration "create transactions table"
```

来源: [Steve O on Twitter](https://twitter.com/stephenoldham/status/1353647972991578120)

## 在另一列之后创建列

注意：仅适用于MySQL

如果要向现有表添加新列，它不一定要成为列表中的最后一列。你可以指定在哪一列之后创建它：

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('phone')->after('email');
});
```

如果要向现有表添加新列，它不一定要成为列表中的最后一列。你可以指定在哪一列之前创建它：

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('phone')->before('created_at');
});
```

如果你希望你的列成为表中的第一列，则使用 `first` 方法。

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('uuid')->first();
});
```

此外，`after()` 方法现在可以用于添加多个字段。

```php
Schema::table('users', function (Blueprint $table) {
    $table->after('remember_token', function ($table){
        $table->string('card_brand')->nullable();
        $table->string('card_last_four', 4)->nullable();
    });
});
```

## 为现有表创建迁移

如果你为现有表创建迁移，并且希望 Laravel 为你生成 Schema::table() 代码，请在末尾添加 "_in_xxxxx_table" 或 "_to_xxxxx_table" ，或者指定 "--table" 参数。  
`php artisan change_fields_products_table` 会生成空的类

```php
class ChangeFieldsProductsTable extends Migration
{
    public function up()
    {
        //
    }
}
```

但是如果添加 `in_xxxxx_table` ，`php artisan make:migration change_fields_in_products_table` 会生成带有预填充的 `Schema::table()` 代码的类

```php
class ChangeFieldsProductsTable extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            //
        })
    };
}
```

你也可以指定 `--table` 参数 `php artisan make:migration whatever_you_want --table=products`

```php
class WhateverYouWant extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            //
        })
    };
}
```

## 运行迁移前输出 SQL

当输入 `migrate --pretend` 命令时，你会在终端中获取将要执行的 SQL 查询语句。这是一种在需要时调试 SQL 的有趣方式。

```php
// Artisan command
php artisan migrate --pretend
```

Tip 来自 [@zarpelon](https://github.com/zarpelon)

## 匿名迁移

Laravel 团队发布了 Laravel 8.37，支持匿名迁移，解决了迁移类名冲突的 GitHub 问题。问题的核心是，如果多个迁移具有相同的类名，尝试从头重新创建数据库时会引发问题。以下是 [拉取请求](https://github.com/laravel/framework/pull/36906) 测试的示例：

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(
    {
        Schema::table('people', function (Blueprint $table) {
            $table->string('first_name')->nullable();
        });
    }

    public function down()
    {
        Schema::table('people', function (Blueprint $table) {
            $table->dropColumn('first_name');
        });
    }
};
```

Tip 来自 [@nicksdot](https://twitter.com/nicksdot/status/1432340806275198978)

## 在迁移中为列添加 “注释”

你可以在迁移中为列添加 “注释”，提供有用的信息。

如果数据库由开发人员以外的其他人管理，他们可以在执行任何操作之前查看表结构中的注释。

```php
$table->unsignedInteger('interval')
    ->index()
    ->comment('This column is used for indexing.')
```

Tip 来自 [@nicksdot](https://twitter.com/nicksdot/status/1432340806275198978)

## 检查 表 / 列是否存在

你可以使用 hasTable 和 hasColumn 方法来检查表或列是否存在：

```php
if (Schema::hasTable('users')) {
    // The "users" table exists...
}

if (Schema::hasColumn('users', 'email')) {
    // The "users" table exists and has an "email" column...
}
```

Tip 来自 [@dipeshsukhia](https://github.com/dipeshsukhia)

## 在 after 方法中分组列

在迁移中，你可以使用 after 方法在另一列后添加多个列：

```php
Schema::table('users', function (Blueprint $table) {
    $table->after('password', function ($table) {
        $table->string('address_line1');
        $table->string('address_line2');
        $table->string('city');
    });
});
```

Tip 来自 [@ncosmeescobedo](https://twitter.com/cosmeescobedo/status/1512233993176973314)

## 仅在数据库表中添加列（如果不存在），并在存在时删除它

现在，你可以仅在数据库表中添加列（如果不存在），并在存在时删除它。为此，引入了以下方法：

👉 whenTableDoesntHaveColumn

👉 whenTableHasColumn

从 Laravel 9.6.0 开始可用

```php
return new class extends Migration {
    public function up()
    {
        Schema::whenTableDoesntHaveColumn('users', 'name', function (Blueprint $table) {
            $table->string('name', 30);
        });
    }

    public function down()
    {
        Schema::whenTableHasColumn('users', 'name', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
}
```

Tip 来自 [@iamharis010](https://twitter.com/iamharis010/status/1510579415163432961)

## 设置当前时间戳的默认值的方法

你可以使用 `useCurrent()` 方法为自定义的时间戳列设置当前时间戳作为默认值。

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->timestamp('added_at')->useCurrent();
    $table->timestamps();
});
```

Tip 来自 [@iamgurmandeep](https://twitter.com/iamgurmandeep/status/1517152425748148225)

