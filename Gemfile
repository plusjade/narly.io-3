source 'https://rubygems.org'

gem 'rails', '3.2.17'
gem 'rugged', git: 'git://github.com/libgit2/rugged.git', branch: 'development', submodules: true
gem 'haml'
gem 'redcarpet'

group :development do
  gem 'capistrano', '~> 3.2.0', require: false
  gem 'capistrano-rails',   '~> 1.1', require: false
  gem 'capistrano-bundler', '~> 1.1', require: false
end

group :assets do
  gem 'sass-rails',   '~> 3'
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', :platforms => :ruby
  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

group :test do
  gem 'cucumber'
  gem 'rspec'
end
