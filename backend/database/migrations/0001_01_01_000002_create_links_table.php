<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id', 20)->unique()->index();
            $table->string('link_target', 2048);
            $table->unsignedBigInteger('passed')->default(0);
            $table->boolean('is_active')->default(true)->index();

            // NULL means the link never expires
            $table->timestamp('valid_until')->nullable();

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            // Standard soft-delete timestamp + who did it
            $table->timestamp('deleted_at')->nullable();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
