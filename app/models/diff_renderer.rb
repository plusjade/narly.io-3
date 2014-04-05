module DiffRenderer
  # TODO: Sanitize
  def self.render(lines)
    ApplicationController.new.render_to_string(partial: "templates/diff", locals: { lines: lines }, formats: [:html]).html_safe
  end
end
