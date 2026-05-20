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
            $table->timestamp('datetime_created');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('datetime_deleted')->nullable();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
