module Sandbox
  def self.get_repo_path(name)
    raise "Invalid repo name" unless name =~ /[\w\.\-]+/

    File.join(Rails.configuration.git_repo_path, name)
  end
end
