# Artisan 命令行

⬆️ [回到主页](README.md#laravel-tips) ⬅️ [上一条 (发送邮件)](mail.md) ➡️ [下一条 (工厂)](factories.md)

## Artisan 命令参数

在创建 Artisan 命令时，你可以以多种方式询问输入： `$this->confirm()`, `$this->anticipate()`, `$this->choice()`.

```php
// Yes or no?
if ($this->confirm('Do you wish to continue?')) {
    //
}

// Open question with auto-complete options
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);

// One of the listed options with default index
$name = $this->choice('What is your name?', ['Taylor', 'Dayle'], $defaultIndex);
```

## 在命令运行完成或出现错误后执行闭包

使用 Laravel 调度器，你可以在命令成功运行时使用 `onSuccess()` 方法执行闭包，也可以在命令出现任何错误时使用 `onFailure()` 方法执行闭包。

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('newsletter:send')
        ->mondays()
        ->onSuccess(fn () => resolve(SendNewsletterSlackNotification::class)->handle(true))
        ->onFailure(fn () => resolve(SendNewsletterSlackNotification::class)->handle(false));
}
```

Tip 来自 [@wendell_adriel](https://twitter.com/wendell_adriel)

## 在特定环境中运行 artisan 命令

掌控你的 Laravel 定时命令。在特定环境中运行它们，以获得最大的灵活性。

```php
$schedule->command('reports:send')
    ->daily()
    ->environments(['production', 'staging']);
```

Tip 来自 [@LaraShout](https://twitter.com/LaraShout)

## 维护模式

如果你想在网站上启用维护模式，请执行 down Artisan 命令：

```bash
php artisan down
```

然后人们将看到默认的 503 状态页面。

你还可以提供标志，在 Laravel 8 中：

- 用户应重定向到的路径
- 预渲染的视图
- 绕过维护模式的秘密短语
- 每 X 秒重试页面加载

```bash
php artisan down --redirect="/" --render="errors::503" --secret="1630542a-246b-4b66-afa1-dd72a4c43515" --retry=60
```

在 Laravel 8 之前:

- 将显示的消息
- 每 X 秒重试页面加载页面
- 某些 IP 仍然允许访问

```bash
php artisan down --message="Upgrading Database" --retry=60 --allow=127.0.0.1
```

完成维护工作后，运行以下命令：

```bash
php artisan up
```

## Artisan 命令帮助

要查看 artisan 命令的选项，请在命令后加上 `--help` 标志。例如，`php artisan make:model --help`，然后查看可用的选项。

```
Options:
  -a, --all             Generate a migration, seeder, factory, policy, resource controller, and form request classes for the model
  -c, --controller      Create a new controller for the model
  -f, --factory         Create a new factory for the model
      --force           Create the class even if the model already exists
  -m, --migration       Create a new migration file for the model
      --morph-pivot     Indicates if the generated model should be a custom polymorphic intermediate table model
      --policy          Create a new policy for the model
  -s, --seed            Create a new seeder for the model
  -p, --pivot           Indicates if the generated model should be a custom intermediate table model
  -r, --resource        Indicates if the generated controller should be a resource controller
      --api             Indicates if the generated controller should be an API resource controller
  -R, --requests        Create new form request classes and use them in the resource controller
      --test            Generate an accompanying PHPUnit test for the Model
      --pest            Generate an accompanying Pest test for the Model
  -h, --help            Display help for the given command. When no command is given display help for the list command
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi|--no-ansi  Force (or disable --no-ansi) ANSI output
  -n, --no-interaction  Do not ask any interactive question
      --env[=ENV]       The environment the command should run under
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug
```

## 精确确定 Laravel 版本

通过运行命令 `php artisan --version` 来准确确定你的应用程序中使用的 Laravel 版本。

## 从任何地方启动 Artisan 命令

如果你有一个 Artisan 命令，你不仅可以从终端中启动它，还可以从代码的任何位置以及带有参数的方式启动。使用 Artisan::call() 方法：

```php
Route::get('/foo', function () {
    $exitCode = Artisan::call('email:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
});
```

## 隐藏自定义命令

如果你不想在 artisan 命令列表中显示特定命令，请将 `hidden` 属性设置为 `true`。

```php
class SendMail extends Command
{
    protected $signature = 'send:mail';
    protected $hidden = true;
}
```

如果你在命令行输入 `php artisan`，则不会看到 `send:mail` 在可用命令中的显示。

Tip 来自 [@sky_0xs](https://twitter.com/sky_0xs/status/1487921500023832579)

## 跳过方法

Laravel 调度器中的 `skip` 方法

你可以在命令中使用 `skip` 来跳过执行。

```php
$schedule->command('emails:send')->daily()->skip(function () {
    return Calendar::isHoliday();
});
```

Tip 来自 [@cosmeescobedo](https://twitter.com/cosmeescobedo/status/1494503181438492675)

