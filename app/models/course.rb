class Course
  def self.all
    return FileUtils.cd(Rails.configuration.git_repo_path) do
      return Dir.glob("plusjade/*")
    end
  end
end
