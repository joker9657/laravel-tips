import{_ as s,o as a,c as n,O as e}from"./chunks/framework.571309da.js";const C=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"artisan.md","filePath":"artisan.md"}'),o={name:"artisan.md"},l=e(`<h2 id="artisan" tabindex="-1">Artisan <a class="header-anchor" href="#artisan" aria-label="Permalink to &quot;Artisan&quot;">​</a></h2><p>⬆️ <a href="./README.html#laravel-tips">Go to main menu</a> ⬅️ <a href="./mail.html">Previous (Mail)</a> ➡️ <a href="./factories.html">Next (Factories)</a></p><ul><li><a href="#artisan-command-parameters">Artisan command parameters</a></li><li><a href="#execute-a-closure-after-command-runs-without-errors-or-has-any-errors">Execute a Closure after command runs without errors or has any errors</a></li><li><a href="#run-artisan-commands-on-specific-environments">Run artisan commands on specific environments</a></li><li><a href="#maintenance-mode">Maintenance Mode</a></li><li><a href="#artisan-command-help">Artisan command help</a></li><li><a href="#exact-laravel-version">Exact Laravel version</a></li><li><a href="#launch-artisan-command-from-anywhere">Launch Artisan command from anywhere</a></li><li><a href="#hide-your-custom-command">Hide your custom command</a></li><li><a href="#skip-method">Skip method</a></li></ul><h3 id="artisan-command-parameters" tabindex="-1">Artisan command parameters <a class="header-anchor" href="#artisan-command-parameters" aria-label="Permalink to &quot;Artisan command parameters&quot;">​</a></h3><p>When creating Artisan command, you can ask the input in variety of ways: <code>$this-&gt;confirm()</code>, <code>$this-&gt;anticipate()</code>, <code>$this-&gt;choice()</code>.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;">// Yes or no?</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">($this-&gt;</span><span style="color:#82AAFF;">confirm</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Do you wish to continue?</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">))</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;font-style:italic;">//</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// Open question with auto-complete options</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">name </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#82AAFF;">anticipate</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">What is your name?</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Taylor</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Dayle</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">]);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// One of the listed options with default index</span></span>
<span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">name </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$this-&gt;</span><span style="color:#82AAFF;">choice</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">What is your name?</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Taylor</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">Dayle</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">],</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">defaultIndex</span><span style="color:#89DDFF;">);</span></span></code></pre></div><h3 id="execute-a-closure-after-command-runs-without-errors-or-has-any-errors" tabindex="-1">Execute a Closure after command runs without errors or has any errors <a class="header-anchor" href="#execute-a-closure-after-command-runs-without-errors-or-has-any-errors" aria-label="Permalink to &quot;Execute a Closure after command runs without errors or has any errors&quot;">​</a></h3><p>With Laravel scheduler you can execute a Closure when a command runs without errors with the onSuccess() method and also when a command has any errors with the onFailure() method.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#C792EA;">protected</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">schedule</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Schedule</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">schedule</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">schedule</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">command</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">newsletter:send</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">mondays</span><span style="color:#89DDFF;">()</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">onSuccess</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">fn</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">resolve</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">SendNewsletterSlackNotification</span><span style="color:#89DDFF;">::</span><span style="color:#F78C6C;">class</span><span style="color:#89DDFF;">)-&gt;</span><span style="color:#82AAFF;">handle</span><span style="color:#89DDFF;">(true))</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">onFailure</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">fn</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">resolve</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">SendNewsletterSlackNotification</span><span style="color:#89DDFF;">::</span><span style="color:#F78C6C;">class</span><span style="color:#89DDFF;">)-&gt;</span><span style="color:#82AAFF;">handle</span><span style="color:#89DDFF;">(false));</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/wendell_adriel" target="_blank" rel="noreferrer">@wendell_adriel</a></p><h3 id="run-artisan-commands-on-specific-environments" tabindex="-1">Run artisan commands on specific environments <a class="header-anchor" href="#run-artisan-commands-on-specific-environments" aria-label="Permalink to &quot;Run artisan commands on specific environments&quot;">​</a></h3><p>Take control of your Laravel scheduled commands. Run them on specific environments for ultimate flexibility.</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">schedule</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">command</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">reports:send</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">daily</span><span style="color:#89DDFF;">()</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">environments</span><span style="color:#89DDFF;">([</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">production</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">staging</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">]);</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/LaraShout" target="_blank" rel="noreferrer">@LaraShout</a></p><h3 id="maintenance-mode" tabindex="-1">Maintenance Mode <a class="header-anchor" href="#maintenance-mode" aria-label="Permalink to &quot;Maintenance Mode&quot;">​</a></h3><p>If you want to enable maintenance mode on your page, execute the down Artisan command:</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">php</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">artisan</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">down</span></span></code></pre></div><p>Then people would see default 503 status page.</p><p>You may also provide flags, in Laravel 8:</p><ul><li>the path the user should be redirected to</li><li>the view that should be prerendered</li><li>secret phrase to bypass maintenance mode</li><li>retry page reload every X seconds</li></ul><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">php</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">artisan</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">down</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--redirect=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">/</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--render=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">errors::503</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--secret=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">1630542a-246b-4b66-afa1-dd72a4c43515</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--retry=60</span></span></code></pre></div><p>Before Laravel 8:</p><ul><li>message that would be shown</li><li>retry page reload every X seconds</li><li>still allow the access to some IP address</li></ul><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">php</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">artisan</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">down</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--message=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">Upgrading Database</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--retry=60</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--allow=127.0.0.1</span></span></code></pre></div><p>When you&#39;ve done the maintenance work, just run:</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">php</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">artisan</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">up</span></span></code></pre></div><h3 id="artisan-command-help" tabindex="-1">Artisan command help <a class="header-anchor" href="#artisan-command-help" aria-label="Permalink to &quot;Artisan command help&quot;">​</a></h3><p>To check the options of artisan command, Run artisan commands with <code>--help</code> flag. For example, <code>php artisan make:model --help</code> and see how many options you have:</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">Options:</span></span>
<span class="line"><span style="color:#A6ACCD;">  -a, --all             Generate a migration, seeder, factory, policy, resource controller, and form request classes for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -c, --controller      Create a new controller for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -f, --factory         Create a new factory for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">      --force           Create the class even if the model already exists</span></span>
<span class="line"><span style="color:#A6ACCD;">  -m, --migration       Create a new migration file for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">      --morph-pivot     Indicates if the generated model should be a custom polymorphic intermediate table model</span></span>
<span class="line"><span style="color:#A6ACCD;">      --policy          Create a new policy for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -s, --seed            Create a new seeder for the model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -p, --pivot           Indicates if the generated model should be a custom intermediate table model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -r, --resource        Indicates if the generated controller should be a resource controller</span></span>
<span class="line"><span style="color:#A6ACCD;">      --api             Indicates if the generated controller should be an API resource controller</span></span>
<span class="line"><span style="color:#A6ACCD;">  -R, --requests        Create new form request classes and use them in the resource controller</span></span>
<span class="line"><span style="color:#A6ACCD;">      --test            Generate an accompanying PHPUnit test for the Model</span></span>
<span class="line"><span style="color:#A6ACCD;">      --pest            Generate an accompanying Pest test for the Model</span></span>
<span class="line"><span style="color:#A6ACCD;">  -h, --help            Display help for the given command. When no command is given display help for the list command</span></span>
<span class="line"><span style="color:#A6ACCD;">  -q, --quiet           Do not output any message</span></span>
<span class="line"><span style="color:#A6ACCD;">  -V, --version         Display this application version</span></span>
<span class="line"><span style="color:#A6ACCD;">      --ansi|--no-ansi  Force (or disable --no-ansi) ANSI output</span></span>
<span class="line"><span style="color:#A6ACCD;">  -n, --no-interaction  Do not ask any interactive question</span></span>
<span class="line"><span style="color:#A6ACCD;">      --env[=ENV]       The environment the command should run under</span></span>
<span class="line"><span style="color:#A6ACCD;">  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug</span></span></code></pre></div><h3 id="exact-laravel-version" tabindex="-1">Exact Laravel version <a class="header-anchor" href="#exact-laravel-version" aria-label="Permalink to &quot;Exact Laravel version&quot;">​</a></h3><p>Find out exactly what Laravel version you have in your app, by running command <code>php artisan --version</code></p><h3 id="launch-artisan-command-from-anywhere" tabindex="-1">Launch Artisan command from anywhere <a class="header-anchor" href="#launch-artisan-command-from-anywhere" aria-label="Permalink to &quot;Launch Artisan command from anywhere&quot;">​</a></h3><p>If you have an Artisan command, you can launch it not only from Terminal, but also from anywhere in your code, with parameters. Use Artisan::call() method:</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">Route</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">get</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">/foo</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">exitCode </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Artisan</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">call</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">email:send</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span></span>
<span class="line"><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">user</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">--queue</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">default</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">]);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;font-style:italic;">//</span></span>
<span class="line"><span style="color:#89DDFF;">});</span></span></code></pre></div><h3 id="hide-your-custom-command" tabindex="-1">Hide your custom command <a class="header-anchor" href="#hide-your-custom-command" aria-label="Permalink to &quot;Hide your custom command&quot;">​</a></h3><p>If you don&#39;t want to show a specific command on the artisan command list, set <code>hidden</code> property to <code>true</code></p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#C792EA;">class</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">SendMail</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">extends</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Command</span></span>
<span class="line"><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#C792EA;">protected</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">signature </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">send:mail</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#C792EA;">protected</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">hidden </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">true;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span></code></pre></div><p>You won&#39;t see <code>send:mail</code> on the available commands if you typed <code>php artisan</code></p><p>Tip given by <a href="https://twitter.com/sky_0xs/status/1487921500023832579" target="_blank" rel="noreferrer">@sky_0xs</a></p><h3 id="skip-method" tabindex="-1">Skip method <a class="header-anchor" href="#skip-method" aria-label="Permalink to &quot;Skip method&quot;">​</a></h3><p>Laravel the skip method in scheduler</p><p>You can use <code>skip</code> in your commands to skip an execution</p><div class="language-php"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">schedule</span><span style="color:#89DDFF;">-&gt;</span><span style="color:#82AAFF;">command</span><span style="color:#89DDFF;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">emails:send</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">)-&gt;</span><span style="color:#82AAFF;">daily</span><span style="color:#89DDFF;">()-&gt;</span><span style="color:#82AAFF;">skip</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Calendar</span><span style="color:#89DDFF;">::</span><span style="color:#82AAFF;">isHoliday</span><span style="color:#89DDFF;">();</span></span>
<span class="line"><span style="color:#89DDFF;">});</span></span></code></pre></div><p>Tip given by <a href="https://twitter.com/cosmeescobedo/status/1494503181438492675" target="_blank" rel="noreferrer">@cosmeescobedo</a></p>`,44),p=[l];function t(r,c,i,y,D,F){return a(),n("div",null,p)}const h=s(o,[["render",t]]);export{C as __pageData,h as default};
