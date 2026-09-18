<?php

namespace App\Providers;

use App\Patterns\Singleton\ConnectionFactory;
use App\Patterns\Singleton\VariabilityConfig;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Amarra os Singletons didáticos ao container do Laravel: o container
     * sempre resolve para a mesma instância (getInstance()), então um
     * controller pode receber VariabilityConfig/ConnectionFactory via
     * type-hint no construtor em vez de chamar ::getInstance() na mão.
     */
    public function register(): void
    {
        $this->app->singleton(VariabilityConfig::class, fn () => VariabilityConfig::getInstance());
        $this->app->singleton(ConnectionFactory::class, fn () => ConnectionFactory::getInstance());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
