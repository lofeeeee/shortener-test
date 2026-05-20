<?php

namespace App\Providers;

use App\Services\HashIdService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(HashIdService::class, fn () => new HashIdService());
    }

    public function boot(): void
    {
        //
    }
}
